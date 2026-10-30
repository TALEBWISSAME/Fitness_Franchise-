# Raccordement React — Sprint 2

Les formulaires utilisent maintenant les routes auth/register et auth/login.
Le profil est chargé depuis GET /api/me au démarrage et après connexion.
Chaque appel utilise credentials: include. Chaque écriture récupère un nouveau
jeton CSRF (y compris après rotation lors du login/logout).

Le contrat d'inscription est celui du backend : displayName, email et password.
Confirmation vérifiée localement ; aucune donnée physiologique demandée.
La déconnexion invalide la session côté serveur avant de retirer le compte.
Les vues sont remontées lors du changement de compte et leurs requêtes annulées.
Le polling des activités est réservé aux utilisateurs connectés.

Les statistiques appellent activity-trend puis activity-summary avec les bornes
exactes retournées par le serveur. Les filtres période/type sont disponibles.
Le graphique affiche les semaines retournées, même si leur nombre diffère de quatre.
Les semaines partielles sont signalées. Les statistiques sont actualisées à 5 s.
L'objectif utilise GET/PUT weekly-goal, affiche la progression et permet la saisie
sans appliquer les filtres historiques à la semaine courante.
L'historique conserve ses filtres locaux sur les seules séances personnelles
chargées ; les totaux de cette liste restent locaux.

Validation : compilation Vite, oxlint sans avertissement et 37 tests Node réussis
(dont cookies/CSRF/expiration et validation du contrat d'inscription).
Le parcours navigateur avec vrais cookies et l'envoi du simulateur restent à
valider ensemble contre un backend démarré sur la base cible préparée.
La base habituelle n'a pas été modifiée pour ce raccordement.
