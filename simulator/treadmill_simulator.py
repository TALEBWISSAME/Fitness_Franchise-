
import json
import random
import time
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Adresse de notre API Spring Boot
API_URL = "http://localhost:8080/api/activities"
MINUTES_PAR_SECONDE = 5


# 1. Simuler une séance avec un temps accéléré
def generer_activite():
    duree = random.randint(15, 45)
    date_debut = datetime.now().isoformat(timespec="seconds")
    temps_ecoule = 0
    distance = 0.0

    print(f"\nDurée prévue : {duree} minutes")
    print(f"Temps accéléré : 1 seconde réelle = {MINUTES_PAR_SECONDE} minutes")
    print("Temps écoulé : 0 min | Distance : 0.00 km | Vitesse : 0.0 km/h")

    while temps_ecoule < duree:
        # Le dernier intervalle est raccourci pour respecter la durée prévue.
        intervalle = min(MINUTES_PAR_SECONDE, duree - temps_ecoule)
        vitesse = round(random.uniform(5.0, 12.0), 1)
        time.sleep(intervalle / MINUTES_PAR_SECONDE)
        distance += vitesse * intervalle / 60
        temps_ecoule += intervalle
        print(
            f"Temps écoulé : {temps_ecoule}/{duree} min | "
            f"Distance : {distance:.2f} km | Vitesse : {vitesse:.1f} km/h"
        )

    print("\nSéance terminée")

    activite = {
        "equipmentType": "TREADMILL",
        "durationMinutes": duree,
        "distanceKm": round(distance, 2),
        "date": date_debut
    }

    return activite


# 2. Envoyer l'activité au backend Spring Boot
def envoyer_activite(activite):
    donnees = json.dumps(activite).encode("utf-8")

    requete = Request(
        API_URL,
        data=donnees,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urlopen(requete, timeout=10) as reponse:
            print("Code HTTP :", reponse.status)
            print("Réponse :", reponse.read().decode("utf-8", errors="replace"))

    except HTTPError as erreur:
        print("Erreur HTTP :", erreur.code)
        print("Détails :", erreur.read().decode("utf-8", errors="replace"))

    except URLError as erreur:
        print("Connexion impossible :", erreur.reason)

    except (TimeoutError, OSError) as erreur:
        print("Erreur de connexion :", erreur)


# 3. Programme principal
def main():

    print("===================================")
    print("FITNESS FRANCHISE — SIMULATEUR DE TAPIS DE COURSE")
    print("===================================")

    activite = generer_activite()

    print("\nJSON final :")
    print(json.dumps(activite, indent=4, ensure_ascii=False))

    print("\nEnvoi vers Spring Boot...")
    envoyer_activite(activite)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nProgramme interrompu. Aucun nouvel envoi ne sera tenté.")
