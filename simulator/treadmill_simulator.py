import http.cookiejar
import json
import os
import random
import time
from datetime import datetime
from getpass import getpass
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPCookieProcessor, Request, build_opener

# The authentication endpoints follow the Sprint 2 API proposal.
API_BASE_URL = os.getenv("FITNESS_API_URL", "http://localhost:8080").rstrip("/")
CSRF_URL = f"{API_BASE_URL}/api/auth/csrf"
LOGIN_URL = f"{API_BASE_URL}/api/auth/login"
ME_URL = f"{API_BASE_URL}/api/me"
ACTIVITIES_URL = f"{API_BASE_URL}/api/activities"
EQUIPMENTS_URL = f"{API_BASE_URL}/api/equipments"
MINUTES_PAR_SECONDE = 5
REQUEST_TIMEOUT = 10
LOGIN_EMAIL_FIELD = os.getenv("FITNESS_LOGIN_EMAIL_FIELD", "email")
CSRF_HEADER_FALLBACK = os.getenv("FITNESS_CSRF_HEADER", "X-CSRF-TOKEN")


def generer_activite():
    """Generate one treadmill session, keeping the Sprint 1 behavior."""
    duree = random.randint(15, 45)
    date_debut = datetime.now().isoformat(timespec="seconds")
    temps_ecoule = 0
    distance = 0.0

    print(f"\nDuree prevue : {duree} minutes")
    print(f"Temps accelere : 1 seconde reelle = {MINUTES_PAR_SECONDE} minutes")
    print("Temps ecoule : 0 min | Distance : 0.00 km | Vitesse : 0.0 km/h")

    while temps_ecoule < duree:
        intervalle = min(MINUTES_PAR_SECONDE, duree - temps_ecoule)
        vitesse = round(random.uniform(5.0, 12.0), 1)
        time.sleep(intervalle / MINUTES_PAR_SECONDE)
        distance += vitesse * intervalle / 60
        temps_ecoule += intervalle
        print(
            f"Temps ecoule : {temps_ecoule}/{duree} min | "
            f"Distance : {distance:.2f} km | Vitesse : {vitesse:.1f} km/h"
        )

    print("\nSeance terminee")
    return {
        "equipmentType": "TREADMILL",
        "durationMinutes": duree,
        "distanceKm": round(distance, 2),
        "date": date_debut,
    }


def ouvrir_reponse_json(opener, requete, description):
    try:
        with opener.open(requete, timeout=REQUEST_TIMEOUT) as reponse:
            contenu = reponse.read().decode("utf-8", errors="replace")
            if not contenu.strip():
                return reponse.status, {}, contenu
            try:
                return reponse.status, json.loads(contenu), contenu
            except json.JSONDecodeError:
                return reponse.status, {}, contenu
    except HTTPError as erreur:
        raise RuntimeError(
            f"{description} refusee (HTTP {erreur.code})."
        ) from erreur
    except URLError as erreur:
        raise RuntimeError(f"Connexion impossible pendant {description} : {erreur.reason}") from erreur
    except TimeoutError as erreur:
        raise RuntimeError(f"Delai depasse pendant {description}.") from erreur


def obtenir_csrf(opener):
    requete = Request(CSRF_URL, headers={"Accept": "application/json"}, method="GET")
    _, donnees, contenu = ouvrir_reponse_json(opener, requete, "la recuperation CSRF")

    jeton = donnees.get("token") or donnees.get("csrfToken") or donnees.get("_csrf")
    nom_entete = donnees.get("headerName") or donnees.get("header_name") or donnees.get("header")

    if isinstance(jeton, dict):
        nom_entete = nom_entete or jeton.get("headerName") or jeton.get("header_name")
        jeton = jeton.get("token")

    if not jeton:
        raise RuntimeError(
            "La route CSRF doit renvoyer un JSON contenant le jeton, par exemple "
            "{\"headerName\": \"X-CSRF-TOKEN\", \"token\": \"...\"}."
        )

    return nom_entete or CSRF_HEADER_FALLBACK, str(jeton)


def identifiants_compte():
    email = os.getenv("FITNESS_EMAIL") or input("Email du compte fictif : ").strip()
    mot_de_passe = os.getenv("FITNESS_PASSWORD") or getpass("Mot de passe du compte fictif : ")
    if not email or not mot_de_passe:
        raise RuntimeError("L'email et le mot de passe sont obligatoires.")
    return email, mot_de_passe


def se_connecter(opener, email, mot_de_passe):
    nom_entete, jeton = obtenir_csrf(opener)
    formulaire = urlencode({
        LOGIN_EMAIL_FIELD: email,
        "password": mot_de_passe,
    }).encode("utf-8")
    requete = Request(
        LOGIN_URL,
        data=formulaire,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            nom_entete: jeton,
        },
        method="POST",
    )
    ouvrir_reponse_json(opener, requete, "la connexion")

    # Spring Security may rotate the CSRF token after authentication.
    obtenir_csrf(opener)
    requete_me = Request(ME_URL, headers={"Accept": "application/json"}, method="GET")
    ouvrir_reponse_json(opener, requete_me, "la verification de session")
    print("Compte connecte.")


def obtenir_id_tapis(opener):
    requete = Request(EQUIPMENTS_URL, headers={"Accept": "application/json"}, method="GET")
    _, equipements, _ = ouvrir_reponse_json(opener, requete, "le chargement des equipements")
    if not isinstance(equipements, list):
        raise RuntimeError("Le catalogue d'equipements a renvoye un format invalide.")

    tapis = next(
        (equipment for equipment in equipements
         if isinstance(equipment, dict) and equipment.get("type") == "TREADMILL"),
        None,
    )
    if tapis is None:
        raise RuntimeError("Aucun equipement de type TREADMILL n'est present dans le catalogue.")

    equipment_id = tapis.get("id")
    if isinstance(equipment_id, bool) or not isinstance(equipment_id, int) or equipment_id <= 0:
        raise RuntimeError("L'equipement TREADMILL du catalogue a un identifiant invalide.")
    return equipment_id


def envoyer_activite(opener, activite):
    # Get a fresh token after login and immediately before the protected write.
    nom_entete, jeton = obtenir_csrf(opener)
    donnees = json.dumps(activite).encode("utf-8")
    requete = Request(
        ACTIVITIES_URL,
        data=donnees,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            nom_entete: jeton,
        },
        method="POST",
    )
    statut, _, contenu = ouvrir_reponse_json(opener, requete, "l'envoi de la seance")
    print("Code HTTP :", statut)
    print("La seance est envoyee pour le compte connecte ; aucun adherent_id n'est fourni par le simulateur.")


def preparer_activite(activite, equipment_id):
    if isinstance(equipment_id, bool) or not isinstance(equipment_id, int) or equipment_id <= 0:
        raise RuntimeError("L'identifiant de l'equipement TREADMILL est invalide.")
    return {
        **activite,
        "equipmentId": equipment_id,
        "equipmentType": "TREADMILL",
    }


def main():
    print("===================================")
    print("FITNESS FRANCHISE - SIMULATEUR DE TAPIS DE COURSE")
    print("===================================")

    email, mot_de_passe = identifiants_compte()
    jar = http.cookiejar.CookieJar()
    opener = build_opener(HTTPCookieProcessor(jar))
    se_connecter(opener, email, mot_de_passe)

    equipment_id = obtenir_id_tapis(opener)
    print("Equipement TREADMILL trouve dans le catalogue.")

    activite = preparer_activite(generer_activite(), equipment_id)
    print("\nJSON final :")
    print(json.dumps(
        {key: value for key, value in activite.items() if key != "equipmentId"},
        indent=4,
        ensure_ascii=False,
    ))
    print("Identifiant de l'equipement masque dans les logs.")
    print("\nEnvoi vers Spring Boot...")
    envoyer_activite(opener, activite)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nProgramme interrompu. Aucun nouvel envoi ne sera tente.")
    except RuntimeError as erreur:
        print("Erreur :", erreur)
