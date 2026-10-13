# Vérifications de l'existant — analyse du 13 octobre 2026

Ce rapport décrit les contrôles exécutés pour l'analyse et la préparation du
Sprint 2. Il ne déclare aucune fonctionnalité future comme terminée.

## Périmètre

- Code local analysé : branche `main`, commit `1585b37cf54e2819bd2c33093778d4223ed89988`.
- GitHub `main` consulté : `eb0853639fa11e0b1fb5a1db4c4b25d85dff5914` ; les fichiers de code correspondent au code local. La différence observée porte sur le responsable T7 du Sprint 1 distant ; aucune synchronisation ni modification de ce document n'a été effectuée.
- Aucun code source, configuration applicative ou script SQL n'a été modifié pour ces contrôles.
- Les commandes de tests/build génèrent uniquement leurs sorties locales habituelles (`backend/target`, `frontend/dist`, fichiers temporaires ignorés).
- Aucun test PostgreSQL, envoi de simulateur ou écriture en base n'a été exécuté dans cette analyse.

## Résultats actuels

| Contrôle | Résultat vérifié le 13 octobre 2026 | Portée |
|---|---|---|
| `ActivityControllerTest` | 17 tests, 0 échec, 0 erreur, 0 ignoré | Réponses GET, tableau vide, validation POST, champs requis/invalides, CORS. Service mocké ; pas de persistance réelle. |
| `ActivityServiceTest` | 2 tests, 0 échec, 0 erreur, 0 ignoré | Lecture triée et transmission des champs au repository ; repository mocké. |
| `HealthControllerTest` | 3 tests, 0 échec, 0 erreur, 0 ignoré | Réponse de santé API et CORS autorisé/refusé. Ne prouve pas la santé de PostgreSQL. |
| **Total sélection backend** | **22 tests réussis, BUILD SUCCESS** | Trois classes sélectionnées explicitement, hors test PostgreSQL. |
| Frontend `npm.cmd run build` | Réussi : 25 modules transformés | Compilation Vite/React ; pas un test de fonctionnement dans un navigateur. |

### Commande backend exécutée

Depuis `backend`, JDK local 21 et cache Maven déjà disponibles :

```powershell
$env:JAVA_HOME = "$PWD\.tools\jdk-21.0.12.1+1"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:MAVEN_USER_HOME = "$PWD\.tools\maven-home"
.\mvnw.cmd -o "-Dmaven.repo.local=$PWD\.tools\repository" '-Dtest=ActivityControllerTest,ActivityServiceTest,HealthControllerTest' test
```

Ces chemins correspondent à cette machine et ne sont pas des dépendances
versionnées. Sur une autre machine, utiliser un JDK 21 installé et la procédure
de lancement adaptée. Le mode offline suppose un cache déjà rempli.

### Commande frontend exécutée

Depuis `frontend`, avec les dépendances déjà installées :

```powershell
npm.cmd run build
```

La première tentative dans le sandbox a échoué sur `spawn EPERM`. La relance
avec l'autorisation d'exécuter les sous-processus a réussi, sans changement du
code ; cette première erreur ne constitue pas un défaut métier démontré.

## PostgreSQL et démonstration : preuves distinctes

Le test [ActivityPostgresIntegrationTest.java](../../backend/src/test/java/com/fitnessfranchise/backend/activity/ActivityPostgresIntegrationTest.java)
existe et nécessite `RUN_POSTGRES_TESTS=true` et un `DB_PASSWORD` non vide.
Il vérifie l'insertion et la relecture de champs sur PostgreSQL, avec rollback
transactionnel ; une séquence peut toutefois être consommée.

Le rapport local antérieur du 11 octobre 2026 contient 23 tests au total,
dont ce test PostgreSQL ignoré (22 réussis, 1 ignoré). Ce rapport est une preuve
historique locale non versionnée, pas une validation PostgreSQL automatisée.
Les nouveaux contrôles ci-dessus ont sélectionné les trois autres classes ;
ils ne réexécutent pas le test PostgreSQL et ne le comptent pas comme réussi.

L'équipe a confirmé manuellement, dans la conversation, l'exécution du
simulateur et la présence d'une nouvelle activité dans `public.activities`.
Cela atteste un essai déclaré par l'équipe, pas un test navigateur/base
nouvellement exécuté par cette analyse. Une capture ou un compte rendu daté
reste à conserver pour la présentation au professeur.

## Couverture absente et prochaines preuves

- Pas de tests frontend automatisés ou de scénario navigateur complet dans le dépôt.
- Pas de tests Python automatisés du simulateur.
- Aucun test actuel d'authentification, de propriétaire d'activité ou de rôle : ces fonctions n'existent pas encore.
- Aucun script SQL versionné ni preuve de recréation complète sur une base vide dans le dépôt.
- Aucun workflow de CI trouvé dans l'arbre versionné local/distant analysé.

Le [Sprint 2 proposé](../sprints/SPRINT%2002.md) prévoit des tests
d'authentification et d'isolation A/B, une vérification PostgreSQL sur données
fictives, une migration reproductible et une démonstration intégrée. Les
résultats futurs ne devront être ajoutés qu'après exécution, avec la date,
le code testé, la commande, le résultat et les éventuelles étapes ignorées.
