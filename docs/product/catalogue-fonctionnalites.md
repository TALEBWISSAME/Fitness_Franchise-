# Fitness Franchise — Catalogue fonctionnel et analyse du dépôt

Date d'analyse : 13 octobre 2026. Statut : proposition à discuter avec l'équipe et le Product Owner ; aucune validation produit n'est présumée.

Révision de planification du 13 octobre : prochaine séance annoncée par l'équipe le **2 novembre 2026**. Le Sprint 2 proposé inclut désormais tableau de bord, filtres et graphique hebdomadaire en Must Have, et un objectif de fréquence en Should Have. Cette sélection ne change pas les constats d'implémentation ci-dessous : ces fonctionnalités restent à développer.

## 1. Vision du produit

Fitness Franchise vise à permettre aux adhérents d'une franchise de consulter leurs séances, suivre leur progression et retrouver les activités provenant des équipements de ses salles. Une administration pourra ensuite gérer les salles, les équipements et les comptes. Cette vision s'appuie sur le [README principal](../../README.md), qui présente ces fonctionnalités comme envisagées, et non comme un cahier des charges validé.

Pour les trois séances restantes, le produit cible recommandé est un parcours cohérent : un adhérent s'authentifie, reçoit ses séances et consulte un historique filtré avec indicateurs et graphique ; une gestion minimale des salles et équipements donne ensuite son sens à la franchise. L'objectif hebdomadaire et des compléments d'engagement sont sélectionnés selon la capacité. La sélection finale dépend des exigences confirmées par le professeur et de la disponibilité réelle de l'équipe.

## 2. Sources, périmètre et limites

| Source | Ce qu'elle permet d'affirmer |
|---|---|
| [README principal](../../README.md) | Vision, acteurs et fonctionnalités envisagées : suivi, régularité, progression, équipements, indicateurs, badges, administration, confidentialité, objectifs/nutrition à étudier. |
| [Sprint 1](../sprints/sprint1.md), sections 2, 5, 6 et 7 | Objectif du premier flux, US1 transmission et US2 enregistrement, tâches et budget prévisionnel de 12 heures-personnes. Ce sont des éléments du Sprint Backlog, pas un Product Backlog complet. |
| [Roadmap initiale](../sprints/README.md) | Plan initial sur cinq sprints, comprenant authentification/adhérents, suivi/progression, administration/engagement, finalisation. |
| [Besoins PO](besoins-po.md), [Product Goal](product-goal.md), [acteurs](acteurs.md) | Fichiers vides à la date de l'analyse ; aucune exigence détaillée ne peut en être déduite. |
| [Réunions](../meetings/README.md), [architecture](../architecture/README.md) | Fichiers vides à la date de l'analyse ; pas de décisions ni de validations du professeur enregistrées. |
| Code backend, frontend et simulateur ; [preuves de tests](../tests/README.md) | État de l'implémentation et niveau de vérification, détaillés ci-dessous. |
| Demande de l'équipe du 13 octobre 2026 | Suggestions A à N, trois séances restantes et responsabilités de Wissame, Meriem et Lamia. Ces suggestions ne sont pas toutes obligatoires. |

L'inventaire couvre les fichiers versionnés du dépôt local `main` au commit `1585b37`, les sources applicatives, les tests, la configuration et les rapports locaux. L'arbre GitHub `main` a aussi été consulté au commit `eb0853639fa11e0b1fb5a1db4c4b25d85dff5914` : les fichiers de code sont identiques ; la différence observée porte sur le responsable T7 dans le Sprint 1 distant. Aucun pull ni modification du Sprint 1 n'a été effectué. Pour la planification future, la demande actuelle fait référence : Lamia prend en charge les simulateurs.

Aucun cahier des charges détaillé, Product Backlog formalisé, script SQL versionné ni workflow de CI n'a été trouvé dans les arbres local et distant consultés. La recherche d'issues GitHub du dépôt n'a retourné aucune issue ; cela ne permet pas de conclure sur un éventuel GitHub Project contenant des cartes brouillon ou un document externe non accessible. Les README de certains composants décrivent encore un état antérieur au code.

**Exigences obligatoires du cahier des charges : non vérifiables faute de source.** Il faut obtenir le document ou les validations du professeur avant de qualifier une fonctionnalité d'obligatoire. Les besoins historiques sont conservés et ne sont pas remplacés par cette proposition.

## 3. Convention de traçabilité

- **S1** : objectif ou User Story documentés dans le Sprint 1.
- **R** : fonctionnalité envisagée dans le README ou la roadmap initiale, sans preuve de validation formelle du PO.
- **U** : suggestion de l'équipe dans la demande actuelle ; proposition à arbitrer.
- **C** : recommandation ajoutée par l'analyse ; proposition à arbitrer.

Un code présent ne signifie pas « terminé ». « Vérifié automatiquement » désigne uniquement le périmètre des tests exécutés, qui peut employer des mocks. Une démonstration manuelle déclarée par l'équipe est identifiée séparément. Aucun élément du Sprint 2 n'est développé dans cette intervention.

## 4. Ce qui existe réellement

| Élément | État et preuve dans le dépôt | Limite de la preuve |
|---|---|---|
| API de santé | `GET /api/health` dans [HealthController.java](../../backend/src/main/java/com/fitnessfranchise/backend/health/HealthController.java) ; tests de réponse JSON et CORS. | L'endpoint indique que l'API répond ; il ne teste pas la santé de PostgreSQL ni du simulateur. |
| Réception d'activité | `POST /api/activities`, validation puis `ActivityService.save`, dans [ActivityController.java](../../backend/src/main/java/com/fitnessfranchise/backend/activity/ActivityController.java) et [ActivityService.java](../../backend/src/main/java/com/fitnessfranchise/backend/activity/ActivityService.java). Réponse 202 ; tests de données valides/invalides. | Les tests du contrôleur utilisent un service mocké : ils ne prouvent pas l'enregistrement réel en base. |
| Lecture d'activités | `GET /api/activities`, tri date puis ID décroissants via [ActivityRepository.java](../../backend/src/main/java/com/fitnessfranchise/backend/activity/ActivityRepository.java). Tests du contrôleur et du service. | Lecture globale, sans propriétaire, filtres ni pagination ; le repository est mocké dans les tests de service. |
| Modèle et persistance | [Activity.java](../../backend/src/main/java/com/fitnessfranchise/backend/activity/Activity.java) mappe `public.activities` : ID, type, durée, distance et date. [application.properties](../../backend/src/main/resources/application.properties) configure PostgreSQL, `DB_PASSWORD` et la validation du schéma. [pom.xml](../../backend/pom.xml) contient JPA et JDBC PostgreSQL. | Aucun script SQL de création/migration versionné ; `ddl-auto=validate` ne crée pas les tables. Le test réel PostgreSQL existe mais n'a pas été réexécuté pendant l'analyse. |
| Contrôle des données | [ActivityRequest.java](../../backend/src/main/java/com/fitnessfranchise/backend/activity/ActivityRequest.java) exige un type non vide, une durée positive, une distance non négative et une date. | Le type est une chaîne libre ; pas de contrôle d'équipement existant ou d'appartenance à un adhérent. |
| Simulateur tapis | [treadmill_simulator.py](../../simulator/treadmill_simulator.py) génère durée/vitesses aléatoires, calcule une distance, accélère le temps et envoie une séance en JSON par HTTP POST. | Une séance par exécution, un seul type, aucun utilisateur ou équipement identifié, pas de tests Python automatisés. |
| Interface connectée | [api.js](../../frontend/src/api.js) utilise `fetch` ; [useActivities.js](../../frontend/src/hooks/useActivities.js) récupère les activités toutes les cinq secondes ; [ActivitiesPage.jsx](../../frontend/src/pages/ActivitiesPage.jsx) les affiche. | Compilation réussie ; aucun test frontend automatisé ni test navigateur complet dans le dépôt. |
| Détail et accueil | [ActivityDetailsModal.jsx](../../frontend/src/components/ActivityDetailsModal.jsx) affiche durée, distance, date et vitesse moyenne calculée ; [HomePage.jsx](../../frontend/src/pages/HomePage.jsx) affiche la dernière activité et l'état de connexion. | Les indicateurs cumulés, objectifs et graphiques d'évolution ne sont pas implémentés. Le statut de l'équipement reste « Non vérifié ». |
| Communication React/backend | [WebConfig.java](../../backend/src/main/java/com/fitnessfranchise/backend/config/WebConfig.java) autorise React local sur `localhost:5173` ; [ApiTestModal.jsx](../../frontend/src/components/ApiTestModal.jsx) appelle l'API de santé. | CORS ne remplace pas une authentification ou un contrôle d'accès. |
| Tests backend | 22 tests ont été réexécutés avec succès le 13 octobre : 17 contrôleur activités, 2 service, 3 santé. [Rapport](../tests/README.md). | Le test PostgreSQL est soumis à activation explicite ; un ancien rapport du 11 octobre le marque ignoré. |
| Démonstration avec PostgreSQL | L'équipe a confirmé dans la conversation l'exécution du simulateur et la présence de l'activité dans la base. | Preuve manuelle déclarée, sans capture ni test complet nouvellement exécuté par l'analyse. Ne pas la présenter comme une suite d'intégration automatisée réussie. |

Le Sprint 1 fournit donc un socle et un premier flux. Le suivi personnel est **partiel** : des activités existent et sont affichées, mais elles ne sont pas associées à des adhérents. L'authentification, la gestion de franchise et l'engagement restent à développer.

## 5. Catalogue des fonctionnalités identifiées

La colonne origine distingue les intentions historiques et les propositions ; elle ne remplace pas un cahier des charges. Les références `PB-*` renvoient au [Product Backlog proposé](product-backlog.md).

| Domaine | Fonctionnalités identifiées et origine | État actuel | Décision recommandée |
|---|---|---|---|
| A — Adhérents | Création de compte, connexion/déconnexion, profil, modification des informations, statut actif/bloqué (U ; gestion des adhérents et authentification R). | Aucun modèle adhérent ni mécanisme d'authentification. Avatar annoncé « à venir » dans [App.jsx](../../frontend/src/App.jsx). | PB-02 à PB-04 au Sprint 2 ; modification PB-09 ensuite ; statut PB-15 avec l'administration. |
| A/C — Propriété des activités | Association de chaque activité à son adhérent et historique personnel (U, suivi R). | Absent : `Activity` ne contient pas d'adhérent et GET retourne toutes les activités. | PB-05 et PB-06 indispensables pour un parcours personnel. |
| B — Physiologie | Poids, taille, âge/date de naissance, IMC, historique des mesures et objectifs physiques (U). Confidentialité des données (R/U). | Aucun champ, stockage, calcul ou écran. | PB-19 à PB-21 reportés tant que leur finalité n'est pas confirmée ; aucune donnée physiologique réelle pour les tests. |
| C — Séances | Enregistrement, durée, distance, type d'équipement, date/heure (S1/R/U). | Implémentés ; tests API/service réussis ; enregistrement PostgreSQL confirmé manuellement par l'équipe. | PB-00 : conserver le flux et renforcer la reproductibilité. |
| C — Consultation | Historique personnel, filtres par dates/type et recherche (R/U). | Liste globale et détails présents ; filtres, recherche et historique personnel absents. | Historique PB-06 et filtres PB-10 en Must Have Sprint 2. Recherche textuelle reportée, car peu utile sur quelques champs structurés. |
| D — Types d'équipements | Tapis, vélo d'appartement, elliptique, simulation de plusieurs types (R/U). | Seul `TREADMILL` est généré ; le backend accepte une chaîne non vide, pas un catalogue de types. | PB-17 ensuite ; paramètres adaptés à chaque type, éviter de copier les règles du tapis au vélo. |
| D/J — Équipements et salles | Identification des équipements, association aux salles, adhérents liés à une salle ; plusieurs salles (R/U). | Aucun modèle ni relation. | PB-13/PB-14 : noyau minimal au deuxième rendez-vous, Sprint 3 ; rattachement d'adhérent PB-16 à confirmer selon la mobilité entre salles. |
| E — Calories | Estimation, données pertinentes, prise en compte du type/intensité, statistiques, justification et limites (indicateurs R ; détail U). | Absent ; les données actuelles ne permettent pas une estimation individualisée suffisamment définie. | PB-22 reporté ; méthode et données à valider avant implémentation. |
| F — Performances | Nombre de séances, distance/durée totales, évolution hebdomadaire/mensuelle, graphiques et comparaison (R/U). | Dernière activité et vitesse moyenne d'une séance seulement. | Totaux PB-08 et graphique hebdomadaire simple PB-11 en Must Have Sprint 2 ; comparaison avancée/mensuelle après, sans classement public. |
| G — Objectifs sportifs | Distance, durée, fréquence, progression et validation des objectifs atteints (R/U). | Absent. | Objectif hebdomadaire de séances PB-12 en Should Have Sprint 2 ; généralisation PB-23 reportée. |
| H — Régularité | Fréquence, jours actifs, séries consécutives, indicateurs d'assiduité (R/U). | Absent. | PB-18 : jours actifs par semaine en premier ; définir le fuseau et les limites de semaine. Séries avancées après. |
| I — Engagement | Badges première séance, distance, régularité, points, récompenses, défis (R/U). | Absent. | PB-24 : badge première séance en Could Have Sprint 2 ; PB-25 points/défis reportés. Aucun catalogue complet avant le noyau métier. |
| J — Franchise | Plusieurs salles, équipements par salle, statistiques par salle et vue globale (R/U). | Absent. | PB-13/PB-14 puis PB-26 pour les statistiques ; vues agrégées après définition des droits. |
| K — Administration | Gestion des comptes, blocage/réactivation, salles, équipements, statistiques globales (R/U). | Absent ; aucun rôle ni écran admin. | PB-15 au noyau administratif ; PB-26 ensuite. L'interface seule ne suffit pas : autorisations serveur nécessaires. |
| L — Notifications | Objectifs/badges atteints, rappels, informations (U). | Absent. | PB-27 : message d'objectif atteint inclus dans le Should Have Sprint 2 ; emails, push et planification de rappels reportés. |
| M — Sécurité | Authentification, rôles, contrôle d'accès, confidentialité et protection des informations (R/U). | Validation et CORS présents ; pas d'authentification ni d'autorisation. | PB-03/PB-05 au Sprint 2 ; PB-15 avec l'admin. La confidentialité des historiques doit être testée côté serveur. |
| M — Droits des utilisateurs | Suppression/export des données si exigés, règles de conservation et information (U ; protection R). | Absent ; aucune validation juridique ou produit. | PB-28 : cadrer les données/finalités puis la portée attendue ; ne pas annoncer une conformité RGPD acquise. |
| N — Qualité | Tests unitaires/intégration, validation, erreurs, documentation API, démonstration et CI si pertinente (U ; tests/documentation S1). | Tests backend partiels et erreurs frontend présents ; pas de CI, contrat API versionné ou migrations SQL. | PB-01/PB-07 transverses ; PB-29 CI optionnelle après lancement reproductible. |
| Autres intentions historiques | Nutrition et fonctionnalités complémentaires autour des objectifs (R : « à étudier avec le PO »). | Absentes. | PB-30 reporté ; finalité et priorité non validées. |

## 6. Recommandations supplémentaires

| Proposition ajoutée | Justification et coût relatif | Position |
|---|---|---|
| Historique strictement limité au compte connecté et scénario de preuve A/B (C, précise A/M) | Rend la valeur personnelle démontrable et empêche un simple filtre React de masquer une fuite côté API. Coût moyen, forte valeur. | PB-05/PB-06, Must Have Sprint 2. |
| Scripts de création/migration et jeu fictif reproductible (C, précise N) | Aujourd'hui, une autre machine ne peut pas recréer le schéma depuis Git. Coût faible à moyen, bénéfice immédiat pour l'équipe et la démonstration. | PB-01, Must Have. |
| Contrat API commun et DTO de sortie (C, précise N) | Permet à Meriem de travailler sur des réponses fictives conformes au contrat ; évite notamment de renvoyer un hash de mot de passe via une entité JPA liée. Coût faible. | Inclus dans les tâches Sprint 2. |
| Identifiant externe de séance pour éviter les doublons lors d'un renvoi (C) | Une requête répétée peut actuellement créer deux activités. Coût moyen ; utile avant des équipements autonomes ou des reprises automatiques. | PB-31, après le parcours personnel. |
| CSV de l'historique personnel (C) | Fonction visible, utile, moins complexe que notifications ou calories ; export limité au propriétaire. Coût faible à moyen. | PB-32, Could Have Sprint 2 après le noyau, sous réserve de capacité. |
| Gestion cohérente des unités et dates (C) | Minutes/km explicites ; décider d'un fuseau de démonstration avant statistiques et régularité, car le modèle actuel utilise `LocalDateTime` sans fuseau. Coût faible au cadrage, plus élevé pour une migration. | Convention au Sprint 2 ; amélioration PB-33 avant usages multi-fuseaux. |

## 7. Stratégie, valeur, dépendances et difficulté

| Groupe | Valeur utilisateur | Difficulté relative | Dépendances et arbitrage |
|---|---|---|---|
| Compte + authentification + historique personnel | Très élevée : le prototype devient un service individuel. | Moyenne à élevée : sessions, contrôles serveur, migration et intégration. | À livrer ensemble ; une page de connexion seule ne suffit pas. |
| Totaux et filtre de période | Élevée, démonstration facile. | Faible à moyenne après propriété des activités. | Must Have Sprint 2, après le raccordement de l'historique personnel. |
| Graphique hebdomadaire + objectif de fréquence | Élevée pour progression et régularité. | Moyenne : dates et semaines doivent être définies. | Graphique simple Must Have Sprint 2, objectif Should ; un seul objectif bien testé. |
| Salles/équipements + administration minimale | Élevée pour l'identité « franchise ». | Moyenne à élevée : relations, rôles et intégrité. | Après comptes ; prioritaire à remonter si le cahier des charges l'exige immédiatement. |
| Badges simples | Moyenne, résultat visuel rapide. | Faible pour un badge, plus élevée pour attribution persistante et absence de doublons. | Après comptage fiable des activités ; option, pas moteur du Sprint 2. |
| Physiologie/IMC/calories | Valeur possible, à confirmer. | Élevée : données nécessaires, confidentialité et méthode. | Cadrage préalable ; ne pas collecter des données uniquement pour enrichir une démo. |
| Notifications, défis, points, statistiques globales avancées | Valeur variable selon le public cible. | Élevée en cumulé. | Reportés pour éviter plusieurs parcours inachevés. |

Ordre recommandé : compte/authentification → appartenance des séances → historique personnel → totaux/filtres → progression/régularité → objectif simple ; en parallèle après les comptes : droits admin → salles → équipements → activité associée à un équipement → statistiques par salle.

Garder Spring Boot, PostgreSQL, React et Python. Une API Spring Boot unique avec contrôleur/service/repository suffit. Pas de microservices, broker de messages ou serveur d'identité séparé pour ce périmètre. Recommandation technique : sessions gérées par Spring Security, avec mot de passe haché, cookie de session HttpOnly, CORS avec origine explicite et prise en charge de CSRF côté React et simulateur. C'est une proposition d'implémentation future, pas un état existant. La [documentation des sessions](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html) et la [documentation CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html) servent de références ; leur configuration doit correspondre à la version gérée par votre Spring Boot.

Pour la confidentialité, commencer par les données nécessaires au parcours : identifiant, email fictif de test, nom d'affichage et hash du mot de passe. Le principe de minimisation consiste à limiter les données à leur finalité ([CNIL](https://www.cnil.fr/fr/definition/minimisation)). Ne pas déclarer la conformité juridique du produit sur cette seule base.

Pour les calories, si le PO les retient ultérieurement, une piste est une méthode documentée reposant sur des catégories d'activité et des intensités MET du [Compendium 2024](https://pacompendium.com/adult-compendium/). Le poids, la durée et l'intensité nécessaires doivent être définis ; la durée et le type seuls ne suffisent pas à une estimation personnalisée. Toute sortie doit rester une estimation avec hypothèses et limites explicites, sans promesse de mesure individuelle exacte. Aucune formule ni fonctionnalité calories n'est validée ou développée ici.

## 8. Décisions à prendre avec le professeur

1. Fournir/identifier le cahier des charges et le backlog éventuellement externes, puis relier chaque exigence à une ligne PB sans en supprimer.
2. Confirmer le parcours prioritaire : adhérent personnel ou administration de franchise.
3. Confirmer la disponibilité individuelle d'ici au 2 novembre : cible enrichie de 64,5 h-personnes plus 13 h de réserve ; le budget du Sprint 1 n'est pas une mesure de vélocité. Les deux dates suivantes sont encore à préciser.
4. Définir l'affectation d'une séance à l'adhérent et le statut d'une séance simulée ; une intégration réelle d'équipement nécessitera un autre mécanisme de confiance.
5. Arbitrer physiologie, calories, export/suppression, multi-salles et badges selon les exigences effectivement demandées.

Le [Product Backlog](product-backlog.md) conserve toutes les pistes ; le [Sprint 2 proposé](../sprints/SPRINT%2002.md) décrit le sous-ensemble sélectionné, les heures-personnes, les critères d'acceptation et les trois rendez-vous.
