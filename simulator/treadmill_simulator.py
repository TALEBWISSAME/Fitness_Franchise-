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
        details = erreur.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"{description} refusee (HTTP {erreur.code}) : {details}"
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
            "{\"headerName\": \"X-CSRF-TOKEN\", \"token\": \"...\"}. "
            f"Reponse recue : {contenu}"
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
    if contenu:
        print("Reponse :", contenu)
    print("La seance est envoyee pour le compte connecte ; aucun adherent_id n'est fourni par le simulateur.")


def main():
    print("===================================")
    print("FITNESS FRANCHISE - SIMULATEUR DE TAPIS DE COURSE")
    print("===================================")
    print("API :", API_BASE_URL)

    email, mot_de_passe = identifiants_compte()
    jar = http.cookiejar.CookieJar()
    opener = build_opener(HTTPCookieProcessor(jar))
    se_connecter(opener, email, mot_de_passe)

    activite = generer_activite()
    print("\nJSON final :")
    print(json.dumps(activite, indent=4, ensure_ascii=False))
    print("\nEnvoi vers Spring Boot...")
    envoyer_activite(opener, activite)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nProgramme interrompu. Aucun nouvel envoi ne sera tente.")
    except RuntimeError as erreur:
        print("Erreur :", erreur)
