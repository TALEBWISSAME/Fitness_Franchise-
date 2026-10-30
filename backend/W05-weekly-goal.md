# W05 — Objectif hebdomadaire (Should Have)

## API

Session requise, propriétaire déduit uniquement de l'identité authentifiée.

- GET /api/me/weekly-goal : objectif et progression de la semaine courante.
- PUT /api/me/weekly-goal : JSON {"targetSessions":3}, session et jeton CSRF.

La cible doit être un entier JSON compris entre 1 et 14. Valeur manquante,
null, fractionnaire, chaîne ou hors limites : 400. Sans session : 401 (une écriture
sans CSRF peut d'abord être refusée 403). CSRF absent ou invalide : 403.
CORS autorise PUT depuis http://localhost:5173 avec credentials et X-CSRF-TOKEN.

Réponse : weekStart, weekEnd, timezone, targetSessions, completedSessions,
progressPercent, achieved. targetSessions vaut null sans objectif, pourcentage
zéro et achieved=false. completedSessions conserve le total réel même sans cible.
Avec une cible, le pourcentage est plafonné à 100 et achieved indique que le total
est supérieur ou égal à la cible. React peut afficher « objectif atteint » lorsque
achieved=true.

## Règles et stockage

Semaine lundi 00:00 au lundi suivant exclusif, dates locales Europe/Paris comme
les activités. Aucun filtre historique n'affecte l'objectif de la semaine courante.
Un seul objectif par compte/semaine grâce à la contrainte SQL de Lamia et à un
INSERT ON CONFLICT DO UPDATE atomique. Modifier la cible conserve les anciennes
semaines ; aucune reconduction automatique. Les séances d'autres comptes et les
anciennes séances sans propriétaire sont exclues du compteur.
Aucun changement du schéma SQL, ni objectifs de durée/distance ajoutés.

## Vérification

WeeklyGoalServiceTest : semaine Paris à cheval sur dimanche UTC, absence de cible,
progression, dépassement, bornes, compte inconnu, isolation et nouvelle semaine.
WeeklyGoalApiTest : session, CSRF, validation stricte et prévol CORS PUT.
AccountPostgresIntegrationTest : création/mise à jour réelle, compteur, borne de
fin, historique conservé et séparation A/B. Transactions de test annulées.

Le raccordement React (M05), les cookies réels et la démonstration collective
restent à vérifier avec l'équipe. Les options badge/CSV ne font pas partie de W05.
