# Sprint 2 — Espace adhérent, tableau de bord et suivi des entraînements

**Statut : proposition enrichie à valider avant tout développement.** Document préparé et révisé le 13 octobre 2026, avec une revue prévue le **2 novembre 2026**, selon l'information de l'équipe. Aucun code du Sprint 2 n'est implémenté par cette intervention.

## 1. Contexte, équipe et capacité

Le [Sprint 1](sprint1.md) a posé le socle Spring Boot/PostgreSQL/React/Python et le premier flux de séance. Le code actuel ne connaît pas les adhérents : la liste des activités est globale. Le [catalogue fonctionnel](../product/catalogue-fonctionnalites.md) décrit les sources, ce qui est testé et les lacunes ; le [Product Backlog](../product/product-backlog.md) conserve les intentions historiques et les nouvelles propositions.

| Membre | Responsabilités pour la suite |
|---|---|
| Wissame | Backend Spring Boot, API REST, logique métier et coordination Scrum. |
| Meriem | Frontend React, formulaires, affichage, composants et expérience utilisateur. |
| Lamia | PostgreSQL, modèle/migrations/jeux fictifs et simulateur Python. |
| Toute l'équipe | Planification, intégration, vérification et préparation de la revue. |

Product Owner : enseignant du module, à consulter pour l'ordre produit et les exigences. Cette répartition organise le travail ; elle ne crée pas de sous-équipes Scrum séparées.

Il reste **trois séances avec le professeur**, dont la prochaine le **2 novembre 2026**. Du 13 octobre au 2 novembre, la fenêtre de préparation est de **20 jours calendaires** ; ce n'est pas 20 jours de travail disponibles par personne. L'équipe souhaite profiter de la période de vacances qu'elle indique pour développer un incrément plus riche. La disponibilité individuelle et les dates des deux séances suivantes restent à confirmer.

Budget révisé avec assistance des LLM autorisée par le professeur, selon l'équipe : **33,5 heures-personnes Must Have**, plus **4 heures-personnes pour l'objectif hebdomadaire Should Have**. La cible représente **37,5 heures-personnes de travail + 7 heures-personnes de réserve = 44,5 heures-personnes de capacité à prévoir**. Les autres options sont hors de ce budget. C'est une estimation optimiste à vérifier pendant le sprint, pas un gain déjà mesuré. La section 8 décrit le repli si la capacité ou l'intégration ne permettent pas toute la cible.

## 2. Sprint Goal

> Permettre à un adhérent de suivre ses entraînements dans un espace personnel : recevoir ses séances simulées, retrouver son historique filtré et comprendre son activité grâce à des indicateurs et un graphique hebdomadaire fiables.

Valeur : le prototype devient un outil de suivi utilisable. L'authentification est un prérequis ; le résultat métier est le tableau de bord alimenté par les séances réelles de test du compte. L'isolation entre deux comptes reste un critère indispensable.

## 3. Périmètre et justification

| Priorité | Fonctionnalités retenues | Justification |
|---|---|---|
| Must Have | Inscription/connexion/déconnexion, profil minimal, séances personnelles et historique ; tableau de bord avec nombre de séances, durée/distance totales ; filtres de dates/type ; graphique des séances sur quatre semaines ; qualité d'interface, base reproductible, tests et démonstration. PB-01 à PB-08, PB-10 et partie simple PB-11. | Apporte un suivi personnel visible et vérifiable, en réutilisant le flux du Sprint 1. |
| Should Have | Objectif hebdomadaire de nombre de séances, progression et message d'atteinte. PB-12 et notification dans la page limitée à cet objectif. | Donne une raison de revenir dans l'application ; une seule règle métier, donc un périmètre contrôlé. |
| Could Have | Badge « première séance » PB-24, export CSV personnel PB-32, modification du nom PB-09. | Compléments utiles après le parcours et les indicateurs validés ; pas de catalogue de badges ou d'export global. |

Hors sélection Sprint 2 : physiologie/IMC/calories, multi-salles, CRUD d'équipements, administration, notifications externes, défis, nutrition, comparaison avancée, objectifs de distance/durée et séries de jours consécutifs. Tous restent dans le backlog. Une exigence formelle découverte doit provoquer un arbitrage avec le PO, et non un ajout automatique à la charge.

### Ce qui doit rendre la plateforme plus professionnelle

Navigation claire entre tableau de bord, activités et profil ; unités et dates cohérentes ; interface lisible sur mobile ; formulaires avec labels et messages d'erreur ; états chargement/vide/indisponibilité ; graphique avec résumé textuel accessible ; aucune valeur fictive présentée comme un résultat réel. Une palette et des composants cohérents prolongent l'interface existante. Cette qualité d'usage est incluse dans le travail, sans refonte complète du design.

## 4. User Stories et critères d'acceptation

### S2-US1 — Créer mon compte (PB-02, version complète)

En tant que nouvel adhérent, je veux créer un compte pour accéder à un espace personnel.

- Email, mot de passe et nom d'affichage valides créent un compte adhérent ; le format et les limites de taille sont définis dans le contrat.
- Email unique selon la règle de normalisation convenue ; doublon renvoie 409 ; données invalides renvoient 400.
- Mot de passe haché avec un encodeur adapté ; ni mot de passe ni hash dans les réponses, les logs ou les captures de preuve.
- Le client ne peut pas choisir un rôle admin.
- La création est persistée et le compte peut ensuite se connecter.

### S2-US2 — Me connecter et me déconnecter (PB-03)

En tant qu'adhérent, je veux m'authentifier et terminer ma session pour accéder à mes données personnelles.

- Identifiants valides : session créée ; invalides : réponse 401 avec message générique.
- Rechargement de la page : session reconnue via le backend ; accès privé sans session : 401.
- Déconnexion invalide la session ; les données de l'ancien compte sont retirées de l'interface.
- Les écritures nécessitent une protection CSRF ; absence/invalidité du jeton est refusée.
- Mauvaise origine CORS refusée ; origine React de développement explicitement autorisée avec credentials.

### S2-US3 — Consulter mon profil minimal (PB-04)

En tant qu'adhérent connecté, je veux voir mon identifiant, mon email et mon nom d'affichage afin de reconnaître mon espace personnel.

- Le profil est déterminé depuis la session et correspond au compte connecté.
- Aucun secret n'est exposé ; chargement, erreur et expiration de session sont pris en charge.
- Aucun poids, taille, âge/date de naissance ou autre donnée physiologique n'est collecté.

### S2-US4 — Recevoir une séance personnelle (PB-05)

En tant qu'adhérent, je veux que ma séance simulée soit enregistrée sur mon compte afin de la retrouver dans mon suivi.

- Le simulateur se connecte avec un compte fictif choisi, récupère le jeton CSRF et envoie la séance avec sa session.
- Le serveur déduit le propriétaire de l'identité authentifiée ; il ne fait pas confiance à un `memberId` envoyé dans le JSON.
- Durée positive, distance non négative, type et date requis : règles existantes conservées.
- La séance est enregistrée dans PostgreSQL avec le bon propriétaire ; envoi non authentifié refusé.
- Les activités du Sprint 1 sans propriétaire restent conservées, non attribuées et exclues des historiques personnels. Aucun rattachement arbitraire.
- Limite annoncée : le simulateur agit comme un client authentifié de démonstration ; l'identification d'une vraie machine et de l'adhérent sur cette machine reste hors scope.

### S2-US5 — Consulter uniquement mon historique (PB-06)

En tant qu'adhérent connecté, je veux retrouver mes séances et leur détail afin de suivre mon activité.

- `GET /api/activities` retourne uniquement les activités du principal connecté, dans l'ordre date/ID décroissant.
- Le tableau et la fenêtre de détail réutilisent les composants existants ; un compte sans séance voit un état vide.
- A ne voit aucune séance de B dans la réponse API, pas seulement dans l'affichage.
- Passer de A à B efface les données de A et annule/ignore ses anciennes requêtes pour éviter leur réapparition.
- Les séances apparaissent après interrogation périodique ou actualisation ; le polling actuel à cinq secondes peut être conservé, seulement lorsque l'utilisateur est connecté.

### S2-US6 — Consulter mon tableau de bord (PB-08, Must Have)

En tant qu'adhérent, je veux voir mon nombre de séances, ma durée totale en minutes et ma distance totale en kilomètres.

- Totaux cohérents avec le jeu de données du compte et la période sélectionnée ; autre compte exclu.
- Compte vide : zéro ; unités affichées ; calcul et affichage vérifiés.
- Une séance nouvelle est prise en compte sans rechargement complet de l'application ; dernière séance et indicateurs restent cohérents.

### S2-US7 — Modifier mon nom d'affichage (PB-09, Could Have)

En tant qu'adhérent, je veux modifier mon nom d'affichage sans changer mon identité de connexion.

- Validation serveur, contrôle du propriétaire, persistance et rafraîchissement de l'affichage.
- L'opération ne modifie ni email, ni rôle, ni mot de passe ; écriture protégée par CSRF.

### S2-US8 — Filtrer mon historique (PB-10, Must Have)

En tant qu'adhérent, je veux filtrer mes séances par période et type d'équipement pour retrouver un entraînement et comprendre mon activité récente.

- Date de début/fin et type sont optionnels ; une période inversée ou un type non reconnu sont refusés avec une erreur claire.
- Les dates choisies sont inclusives pour l'utilisateur ; l'API convertit la fin en borne exclusive au début du jour suivant selon Europe/Paris pour la démo.
- Liste, totaux et graphique utilisent la même période ; réinitialiser les filtres restaure la vue attendue.
- Aucun filtre ne permet de demander les activités d'un autre membre.
- Le simulateur actuel ne produit que du tapis : le filtre est vérifié avec un jeu fictif contenant au moins deux types reconnus. Cela ne signifie pas qu'un simulateur vélo est développé.

### S2-US9 — Comprendre mon évolution (PB-11, Must Have simple)

En tant qu'adhérent, je veux voir le nombre de mes séances par semaine sur un graphique pour visualiser mon rythme d'entraînement.

- Par défaut, quatre semaines calendaires dont la semaine en cours, du lundi 00:00 au lundi suivant, selon la convention Europe/Paris.
- Une semaine sans séance affiche zéro ; les semaines et unités sont clairement identifiées.
- Dans une période filtrée, préciser les semaines partiellement couvertes ; les valeurs concordent avec les séances comprises dans les bornes.
- Jeu fixe avec semaines vides, changement de semaine, plusieurs comptes et bornes de date ; graphique accompagné de valeurs textuelles.
- Pas de comparaison publique entre adhérents ni de prévision de performance.

### S2-US10 — Suivre un objectif hebdomadaire (PB-12, Should Have)

En tant qu'adhérent, je veux choisir un nombre de séances à effectuer dans la semaine et voir ma progression pour suivre mon objectif.

- Cible entière de 1 à 14 séances, modifiable pour la semaine en cours ; un seul objectif de fréquence par compte et semaine.
- Semaines définies comme dans US9 ; historique d'objectif conservé lors du passage à une nouvelle semaine, sans reconduction automatique dans ce sprint.
- Afficher `séances effectuées / cible` ; barre plafonnée à 100 % tout en gardant le nombre réel de séances.
- Message « objectif atteint » dès que la cible est atteinte ; zéro, dépassement et autre compte testés.
- Cet objectif porte sur le nombre de séances, pas sur une prescription de santé, les calories ou les jours consécutifs.

### S2-US11 — Voir mon premier badge (PB-24, Could Have)

En tant qu'adhérent, je veux voir un badge « première séance » dès que mon historique contient une séance.

- Badge dérivé des données personnelles, visible pour le bon compte, absent pour un compte vide.
- Pas de points, catalogue complet, notification externe ou moteur d'attribution persistant pour cette option.

### S2-US12 — Exporter mon historique (PB-32, Could Have)

En tant qu'adhérent, je veux télécharger mes séances filtrées en CSV pour les conserver.

- Export limité au compte et aux filtres actifs, avec en-têtes et unités explicites.
- Les valeurs textuelles sont échappées correctement, y compris celles pouvant être interprétées comme formules dans un tableur.
- Jeu vide et isolation A/B vérifiés ; aucune donnée de compte secrète exportée.

## 5. Choix techniques proposés et contrat partagé

Conserver une API Spring Boot avec les couches contrôleur/service/repository, PostgreSQL, React et le simulateur Python. Ajouter seulement le module Spring Security et les éléments nécessaires au parcours. Les références officielles de [gestion de session](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html) et [CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html) guident le futur travail ; utiliser la version compatible gérée par Spring Boot.

### Données

- Table adhérents : ID généré, email unique normalisé, nom d'affichage, hash de mot de passe ; rôle adhérent par défaut, pas de rôle modifiable via l'inscription.
- Ajouter une relation adhérent-activité avec clé étrangère et index adapté à la lecture par adhérent/date. La colonne peut rester nullable pour les activités historiques non attribuées ; toute nouvelle création par l'API doit avoir un propriétaire serveur.
- Lamia prépare les scripts numérotés de création/migration, les instructions d'application et les fixtures fictives ; Wissame adapte les entités Java et DTO. Ne pas changer `ddl-auto=validate` en génération destructive du schéma.
- Pour l'objectif Should Have : table avec adhérent, lundi de référence et cible ; unicité adhérent/semaine, clé étrangère et validation de la cible. Ne pas stocker un pourcentage qui deviendrait obsolète : le calculer à partir des séances.
- Fixtures de progression : deux comptes, plusieurs semaines dont une vide, séances aux bornes de période et au moins deux types d'activité reconnus ; uniquement données fictives. Une fixture d'activité vélo ne remplace pas le développement d'un simulateur vélo.
- Les DTO de réponse exposent uniquement les champs nécessaires ; éviter de sérialiser directement une entité adhérent liée à une activité et d'exposer son hash ou de créer une récursion JPA.
- Convention de dates proposée pour la démo : même heure locale de référence Europe/Paris entre simulateur, API et affichage ; cette convention doit être documentée. Le modèle actuel sans fuseau ne devient pas pour autant adapté aux instants internationaux ; PB-33 conserve ce travail.

### Contrat API prévisionnel à fixer lors de la planification

Ces routes sont **proposées**, pas déjà développées. Si leur détail change lors de la validation, mettre à jour le contrat avant les trois implémentations.

| Méthode et route | Accès et contenu | Résultat proposé |
|---|---|---|
| `GET /api/health` | Public, endpoint existant. | 200, réponse actuelle ; ne prétend pas contrôler la base. |
| `GET /api/auth/csrf` | Initialisation de session et obtention du nom de header + jeton CSRF. | 200 ; mécanisme à renouveler après connexion/déconnexion. |
| `POST /api/auth/register` | Version complète ; JSON `{email, password, displayName}`, jeton CSRF. | 201, DTO sans secret ; 400 invalidité, 409 doublon. |
| `POST /api/auth/login` | Identifiants via formulaire HTTP `application/x-www-form-urlencoded` géré par Spring Security ; jeton CSRF. | 200 JSON minimal et cookie de session ; 401 identifiants invalides. |
| `POST /api/auth/logout` | Session et jeton CSRF. | 204, session invalidée. |
| `GET /api/me` | Session ; aucun ID de membre arbitraire dans la requête. | 200 `{id, email, displayName}` ; 401 sans session. |
| `POST /api/activities` | Session + jeton CSRF ; champs du Sprint 1 uniquement. | 202 conservé pour une activité valide ; propriétaire attribué côté serveur. |
| `GET /api/activities` | Session ; lecture personnelle ; filtres optionnels `from`, `to`, `equipmentType`. | 200, tableau des séances personnelles filtrées ; 400 filtre invalide, 401 sans session. |
| `GET /api/me/activity-summary` | Must PB-08, session et mêmes filtres. | 200, nombre/durée/distance personnels de la période. |
| `GET /api/me/activity-trend` | Must PB-11, session et mêmes filtres. | 200, semaines avec nombre de séances, zéros inclus. |
| `GET /api/me/weekly-goal` | Should PB-12, session, semaine en cours. | 200, objectif et progression ou état sans objectif. |
| `PUT /api/me/weekly-goal` | Should PB-12, session + CSRF, cible de semaine courante. | 200 DTO de l'objectif ; 400 cible invalide. |
| `GET /api/me/activities.csv` | Could PB-32, session et filtres. | 200 CSV personnel uniquement. |
| `PATCH /api/me` | Option PB-09, session + CSRF ; nom uniquement. | 200 DTO minimal ; 400 invalidité. |

React utilise `credentials: 'include'` pour la session ; CORS doit autoriser explicitement l'origine locale et les credentials, ainsi que les méthodes réellement nécessaires. Le cookie de session reste HttpOnly ; prévoir Secure lors d'un déploiement HTTPS, sans l'imposer à une démo HTTP locale. Ne pas stocker un faux jeton d'authentification dans le navigateur pour simuler une sécurité inexistante.

Les filtres sont communs au tableau, aux indicateurs et au graphique : l'interface initialise la période aux quatre semaines de US9 et transmet les mêmes bornes aux trois endpoints. Une vue « tout l'historique » peut être sélectionnée explicitement. Le détail ne change pas ses données selon les filtres. L'objectif affiche toujours la semaine en cours, indépendamment d'un filtre historique, avec son libellé explicite.

Le simulateur peut réutiliser la bibliothèque standard Python avec un cookie jar et l'en-tête CSRF ; ses identifiants fictifs proviennent d'une saisie ou de variables d'environnement, sans secret réel versionné. Son envoi doit utiliser le même mécanisme de session que le frontend pour ce périmètre de démonstration.

## 6. Tâches, responsabilités et heures-personnes

Les tâches ci-dessous reprennent la répartition de l'équipe en langage simple. Les durées supposent la réutilisation du Sprint 1 et l'aide des LLM ; elles incluent la compréhension du code proposé, sa correction et ses tests. Ce sont des prévisions à comparer au temps réellement passé.

**Prioritaire** : à réaliser pour le Sprint Goal. **Ensuite** : objectif hebdomadaire si les fonctionnalités principales fonctionnent. **Optionnel** : seulement s'il reste du temps.

Pour les lignes collectives, **1,5 h-personne = 0,5 h de travail pour chacune des trois développeuses**. Ce temps n'est pas inclus dans les sous-totaux individuels du premier tableau ; il est ajouté une seule fois dans le récapitulatif.

| ID | Responsable | Tâche | Priorité | Temps estimé |
|---|---|---|---|---|
| W01 | Wissame | Permettre aux adhérents de créer un compte, se connecter et se déconnecter. | Prioritaire | 3 h |
| W02 | Wissame | Enregistrer chaque séance sur le compte du bon adhérent. | Prioritaire | 1 h |
| W03 | Wissame | Faire en sorte que chacun puisse consulter uniquement ses propres activités. | Prioritaire | 1 h |
| W04 | Wissame | Calculer le nombre de séances, la durée totale et la distance totale. | Prioritaire | 2 h |
| W05 | Wissame | Préparer les données nécessaires au graphique et à l'objectif hebdomadaire. | Graphique prioritaire ; objectif ensuite | 2,5 h |
| W06 | Wissame | Tester ces fonctionnalités et suivre l'avancement de l'équipe. | Prioritaire | 3 h |
|  | **Sous-total Wissame** | **Travail individuel, objectif compris** |  | **12,5 h** |
| M01 | Meriem | Créer les pages d'inscription, de connexion et de profil. | Prioritaire | 3,25 h |
| M02 | Meriem | Afficher l'historique personnel des séances. | Prioritaire | 1,5 h |
| M03 | Meriem | Ajouter les filtres pour choisir une période ou un équipement. | Prioritaire | 1 h |
| M04 | Meriem | Construire le tableau de bord et le graphique hebdomadaire. | Prioritaire | 2,75 h |
| M05 | Meriem | Afficher la progression de l'objectif. | Ensuite | 1,5 h |
| M06 | Meriem | Rendre les pages claires et utilisables sur ordinateur et téléphone. | Prioritaire | 2,5 h |
|  | **Sous-total Meriem** | **Travail individuel, objectif compris** |  | **12,5 h** |
| L01 | Lamia | Préparer les tables pour les comptes, les séances et les objectifs. | Comptes et séances prioritaires ; objectifs ensuite | 2 h |
| L02 | Lamia | Relier chaque séance à son adhérent dans la base. | Prioritaire | 0,5 h |
| L03 | Lamia | Adapter le simulateur pour envoyer une séance sur le bon compte. | Prioritaire | 1,5 h |
| L04 | Lamia | Préparer des données fictives sur plusieurs semaines pour vérifier les statistiques. | Prioritaire | 1,5 h |
| L05 | Lamia | Vérifier que les informations sont correctement enregistrées. | Prioritaire | 1,5 h |
| L06 | Lamia | Documenter comment préparer la base sur une autre machine. | Prioritaire | 1 h |
|  | **Sous-total Lamia** | **Travail individuel, objectif compris** |  | **8 h** |
| E01 | Toute l'équipe | Relier les différentes parties et vérifier qu'elles fonctionnent ensemble. | Prioritaire | 1,5 h |
| E02 | Toute l'équipe | Tester avec deux comptes pour vérifier que leurs activités restent séparées. | Prioritaire | 1,5 h |
| E03 | Toute l'équipe | Corriger les problèmes et préparer la démonstration du 2 novembre. | Prioritaire | 1,5 h |
|  | **Sous-total collectif** | **0,5 h chacune pour chaque tâche collective** |  | **4,5 h** |
|  | **Total du travail prévu** | **Fonctionnalités principales et objectif hebdomadaire** |  | **37,5 h-personnes** |

Dans W05, compter **1 h pour le graphique** et **1,5 h pour l'objectif**. Dans L01, compter **1 h pour les comptes/séances** et **1 h pour l'objectif**. Avec M05 (1,5 h), l'objectif représente donc **4 h-personnes**, déjà incluses dans les lignes ci-dessus. Les fonctionnalités principales, sans l'objectif, représentent **33,5 h-personnes**.

Les détails techniques restent décrits dans les critères d'acceptation : W01/W03 couvrent la protection des accès ; W04 inclut la sélection des séances selon les filtres ; W01/W06 incluent les informations de profil renvoyées par le backend et les contrôles associés. Les tests individuels vérifient chaque partie ; E01/E02 vérifient le parcours complet ensemble. La planification et le suivi sont inclus dans W06 et les échanges collectifs.

L'objectif hebdomadaire est prévu **après les fonctionnalités principales**. Le badge et l'export CSV seront ajoutés seulement s'il reste du temps.

| ID | Tâche supplémentaire | Responsable | Priorité | Temps estimé hors budget principal |
|---|---|---|---|---|
| O01 | Permettre de modifier son nom d'affichage. | Wissame : 0,75 h ; Meriem : 0,75 h ; Lamia : 0,5 h | Optionnel | 2 h |
| O02 | Afficher un badge après la première séance. | Wissame : 0,5 h ; Meriem : 1 h ; Lamia : 0,5 h | Optionnel | 2 h |
| O03 | Permettre de télécharger ses séances dans un fichier CSV, ouvrable dans un tableur. | Wissame : 1 h ; Meriem : 0,5 h ; Lamia : 0,5 h | Optionnel | 2 h |

### Charge par membre et réserve

| Membre | Must Have | Objectif Should Have | Réserve pour imprévus | Capacité pour la cible enrichie |
|---|---|---|---|---|
| Wissame | 12,5 h | 1,5 h | 2,5 h | 16,5 h |
| Meriem | 12,5 h | 1,5 h | 2,5 h | 16,5 h |
| Lamia | 8,5 h | 1 h | 2 h | 11,5 h |
| **Total** | **33,5 h** | **4 h** | **7 h** | **44,5 h-personnes** |

La réserve n'est pas une tâche déjà dépensée ni un budget automatique pour les Could Have. Must + Should = **37,5 h de travail prévu** ; toutes options incluses = **43,5 h**, hors réserve. Must seul avec la même réserve représente **40,5 h de capacité**. La cible demande 16,5 h à Wissame, 16,5 h à Meriem et 11,5 h à Lamia sur la période, sous l'hypothèse d'une assistance LLM efficace et d'un périmètre limité aux critères décrits. Confirmer une disponibilité soutenable et comparer les estimations au temps réel.

## 7. Travail parallèle et jalons

1. **Après validation, planification commune :** les trois développeuses fixent champs, routes, réponses, erreurs, schéma et scénarios A/B. Wissame coordonne ce travail dans W06 et les échanges d'équipe. Déposer des exemples fictifs conformes au contrat pour le travail frontend.
2. **Premier travail parallèle :** Lamia prépare migration/fixtures ; Wissame construit comptes/sessions/DTO à partir du schéma convenu ; Meriem développe formulaires/profil/historique avec réponses temporaires conformes au contrat. Ces réponses ne sont pas une preuve de fonctionnalité finale.
3. **Premier raccordement tôt :** dès qu'un compte peut se connecter, tester login → `/api/me` depuis React et Python avec session/CSRF. Résoudre les questions CORS/cookies avant la dernière journée de travail.
4. **Deuxième parallèle :** Wissame finalise propriété, filtres et agrégations ; Lamia adapte le simulateur et prépare les fixtures multi-semaines et leurs résultats attendus ; Meriem raccorde la vraie API puis construit les cartes et le graphique à partir du contrat.
5. **Objectif Should Have :** une fois le parcours personnel intégré, Lamia prépare sa table, Wissame implémente la règle et Meriem l'interface ; le retirer si la capacité ou un défaut bloquant l'exigent.
6. **Intégration et préparation de revue E01 à E03 :** exécuter le scénario A/B et les scénarios de statistiques, les tests et le build ; enregistrer les résultats. Les options ne commencent qu'après validation des tâches prioritaires et confirmation du temps restant.

### Planning jusqu'au 2 novembre 2026

| Période | Wissame | Meriem | Lamia | Jalon d'équipe |
|---|---|---|---|---|
| 13–15 octobre | Contrat API et plan des règles métier | Parcours/pages et exemples de réponses | Schéma/migrations et plan des fixtures | Sélection et capacité confirmées ; critères clairs, tâches visibles. |
| 16–20 octobre | Comptes, session, propriété des activités | Inscription/connexion/profil et raccordement du parcours | Base reproductible, comptes fictifs, simulateur authentifié | A/B fonctionne de bout en bout ; première intégration avant les statistiques. |
| 21–25 octobre | Totaux, filtres et agrégations hebdomadaires | Tableau de bord, filtres et graphique | Jeu multi-semaines, SQL et cas limites | Must métier visible : chiffres et graphique concordent avec la base. |
| 26–28 octobre | Objectif de fréquence et tests si noyau stable | Progression de l'objectif, finitions | Table objectif et fixtures ; contrôles de persistance | Décision de conserver/couper le Should ; au plus une option courte si capacité réelle. |
| 29 octobre–1 novembre | Régression et corrections | Vérification des parcours et de l'affichage | Recréation/migration base de test et répétition simulateur | Gel des nouvelles fonctionnalités ; preuves, répétition et revue prête. |
| 2 novembre | Présentation des décisions, backend et bilan Scrum | Démonstration de l'espace adhérent | Démonstration du simulateur et de la base | Revue avec le professeur, feedback et priorités du Sprint 3. |

Ces périodes sont des jalons de préparation, pas des journées de présence imposées. En cas de retard au 20 octobre, revoir la capacité et couper les Could Have ; au 25 octobre, arbitrer l'objectif Should plutôt que consommer les jours de vérification finale.

Pendant le sprint, point court quotidien les jours travaillés pour adapter le plan vers le Sprint Goal : avancement visible, blocage, prochaine intégration. Wissame facilite la résolution des blocages et la tenue des événements ; chacune met à jour ses tâches et preuves. Le PO arbitre les priorités, les développeuses s'organisent pour réaliser l'incrément.

## 8. Version réduite si capacité insuffisante

Couper d'abord les Could Have, puis l'objectif Should Have : le Must enrichi conserve le tableau de bord, les filtres et le graphique. Si cela ne suffit pas, renégocier avec le PO un Sprint Goal réduit : **recevoir ses séances, consulter son historique filtré et ses trois totaux personnels**. Dans ce repli, le graphique est différé, les comptes fictifs sont précréés et le profil se limite à l'identité du compte. Ne pas annoncer le Sprint Goal enrichi comme atteint si le graphique manque. Aucun raccourci sur l'isolation serveur, le hachage, CSRF ou la conservation des séances.

Le tableau suivant chiffre la fondation minimale du repli ; les ajouts métier sont chiffrés juste après, afin que ce repli ne se limite pas à la connexion et au profil. Ses identifiants R01 à R14 désignent uniquement les tâches de ce scénario alternatif ; son budget remplace le plan principal et ne s'y ajoute pas.

| Tâche | Ajustement de périmètre | Estimation réduite |
|---|---|---|
| R01 | Contrat et planification conservés | 0,75 h |
| R02 | Deux comptes fictifs précréés, migration ciblée et relations | 2 h |
| R03 | Connexion/déconnexion/sessions/CSRF, sans inscription libre | 2 h |
| R04 | Lecture du compte connecté minimale | 0,5 h |
| R05 | Propriété serveur et historique personnel conservés | 1,5 h |
| R06 | Connexion/déconnexion seulement | 1,5 h |
| R07 | Nom du compte dans l'interface, sans page dédiée | 0,25 h |
| R08 | Historique personnel et nettoyage des anciennes données | 1,5 h |
| R09 | Simulateur paramétré pour A/B | 1 h |
| R10 | Vérification SQL ciblée et reproductibilité | 0,5 h |
| R11 | Authentification, CSRF, isolation A/B et régression indispensables | 1,5 h |
| R12 | Démonstration et intégration : 0,75 h chacune | 2,25 h |
| R13 | Documentation/preuves/bilan : 0,25 h chacune | 0,75 h |
| R14 | Vérification interface ciblée | 0,5 h |
| **Sous-total fondation** | **Comptes précréés et historique personnel** | **16,5 h-personnes** |

| Ajout métier au repli | Répartition | Estimation |
|---|---|---|
| Trois totaux personnels | Wissame 0,75 h ; Meriem 0,75 h | 1,5 h |
| Filtres de période et type | Wissame 1 h ; Meriem 1 h | 2 h |
| Jeu fictif ciblé aux bornes de période | Lamia 1 h | 1 h |
| Vérification des statistiques/SQL/interface | Wissame 0,5 h ; Meriem 0,25 h ; Lamia 0,25 h | 1 h |
| **Total ajouts métier** |  | **5,5 h-personnes** |

Repli complet avec assistance LLM : **22 h-personnes**, réparties entre Wissame 9 h, Meriem 7 h et Lamia 6 h. Réserve supplémentaire : 2 h Wissame, 1,5 h Meriem, 1 h Lamia ; capacité visée **26,5 h-personnes**. Ce scénario est une solution de repli, pas la cible demandée pour le 2 novembre. Confirmer les disponibilités et l'arbitrage avec le PO si son utilisation devient nécessaire.

## 9. Definition of Done proposée

Un item peut être déclaré terminé lorsque ses critères sont satisfaits dans le parcours intégré :

- Code revu par une autre développeuse, contrat/schema alignés et lancement documenté.
- Tests correspondant au comportement exécutés ; échecs/étapes ignorées signalés ; régressions du Sprint 1 contrôlées.
- Compilation React réussie ; navigation/formulaires/états d'erreur vérifiés dans le navigateur.
- Pour la persistance : migration et scénario PostgreSQL contrôlés sur données fictives, pas seulement repository mocké.
- Pour les données personnelles : preuve d'isolation A/B au niveau des réponses serveur ; aucune fuite de secrets dans les DTO/logs.
- Démonstration reproductible et résultats consignés ; item lié à ses preuves et reste à faire explicitement noté.

« Terminé » ne signifie pas conformité juridique générale ni préparation à un déploiement réel d'équipements. Cette Definition of Done est à adopter avec l'équipe ; elle n'est pas rétrospectivement appliquée pour réécrire le Sprint 1.

## 10. Scénario de revue et preuves attendues

Utiliser uniquement des comptes fictifs A/B et des séances de test, pas de données physiologiques réelles.

| Étape | Action | Preuve attendue |
|---|---|---|
| 1 | Présenter le Sprint Goal, les stories sélectionnées, les dépendances et le budget. | Tableau de suivi réel, choix de périmètre, estimé/réel et blocages résolus ; aucune réunion fictive. |
| 2 | Créer A/B dans la version complète ou montrer qu'ils sont précréés dans la version réduite. | Résultat d'inscription/connexion ; limite annoncée si inscription hors scope. |
| 3 | Se connecter en A dans React ; envoyer une séance depuis le simulateur connecté en A. | Réponse POST valide, séance dans PostgreSQL avec propriétaire A, séance affichée en A. |
| 4 | Se déconnecter, se connecter en B et envoyer une séance B. | L'API et l'interface de B n'affichent que B ; celles de A n'affichent que A. |
| 5 | Appeler une route privée sans session, tenter une attribution arbitraire et une écriture sans CSRF. | Tests/réponses attestant refus ou non-prise en compte de l'ID client ; aucune fuite. |
| 6 | Consulter la base et les données anciennes. | Clés étrangères cohérentes ; anciennes séances non attribuées conservées et invisibles aux adhérents. |
| 7 | Afficher le tableau de bord et le graphique sur le jeu multi-semaines. | Nombre de séances, durée, distance et semaines vides concordent avec les résultats SQL attendus. |
| 8 | Filtrer une période et un type puis réinitialiser. | Tableau, totaux et graphique cohérents ; cas de bornes et de compte vide visibles. |
| 9 | Si développé, définir puis atteindre l'objectif hebdomadaire ; montrer éventuellement badge/CSV. | Progression réelle, message d'atteinte ; options absentes annoncées comme non réalisées. |
| 10 | Montrer résultats de tests et build. | Commande, date, commit/code testé, périmètre, chiffres et étapes ignorées ; captures sans secrets. |
| 11 | Recueillir le retour et définir la suite. | Décisions du PO, backlog ajusté et une amélioration de rétrospective mesurable. |

Pour le test PostgreSQL existant, l'activation requiert `RUN_POSTGRES_TESTS=true` et un `DB_PASSWORD` non vide. Utiliser une base de test fictive et isolée ; vérifier la configuration avant exécution. Les nouveaux tests devront couvrir les relations propriétaires et ne pas dépendre de la base personnelle de l'équipe.

## 11. Planning des trois séances restantes

Cette section actualise la roadmap de travail après l'annonce de la revue du 2 novembre, sans supprimer la roadmap initiale ni supposer un Sprint 5 supplémentaire. Les dates des deux séances suivantes ne sont pas connues.

| Séance restante | Travail préparé entre les séances | Revue et décision avec le professeur | Preuves / coupe de périmètre |
|---|---|---|---|
| 1 — Sprint 2, 2 novembre 2026 | Espace adhérent, historique, totaux, filtres et graphique ; objectif hebdomadaire visé en Should. | Vérifier la valeur du suivi, l'isolation A/B et les chiffres ; confirmer la priorité de la franchise. | Jeu multi-semaines, base, tests, suivi de tâches et écarts. Couper Could Have puis objectif, avant de renégocier le Must. |
| 2 — Sprint 3, date à confirmer | Salles/équipements identifiés, droits admin et rattachement d'activité ; blocage de comptes/vélo si capacité. | Vérifier les règles multi-salles et les accès, préserver le parcours personnel. | Deux salles/équipements, séance rattachée, droits serveur et simulateur ; régression des indicateurs. |
| 3 — Sprint 4 / bilan, date à confirmer | Régularité/objectif simple si reporté, un badge utile, consolidation, tests et documentation finale. | Démontrer le produit intégré, présenter le bilan Scrum et les limites restantes. | Parcours répété, règles métier vérifiées, données reproductibles, écarts et décisions. Pas de nouvelle grande fonctionnalité en dernière minute. |

Ordres de grandeur de Sprint 3 et Sprint 4, répartition et dépendances : [Product Backlog, section 4](../product/product-backlog.md). Le contenu des deux prochaines revues sera ajusté selon ce qui est effectivement terminé le 2 novembre et le feedback du professeur.

## 12. Risques et réponses

| Risque | Réponse prévue | Responsable du suivi |
|---|---|---|
| Cahier des charges absent ou backlog externe inconnu | Retrouver les sources, confirmer les exigences avant de figer la sélection. Ne pas qualifier les suggestions d'obligatoires. | Wissame avec PO et équipe |
| Sous-estimation de l'authentification | Test session/CSRF depuis React et Python au premier jalon, repli et réserve ; réestimer si défaut bloquant. | Wissame, Meriem, Lamia |
| Capacité backend insuffisante | Confirmer disponibilité individuelle ; retirer options/inscription selon plan réduit ; ajuster objectif avec PO si nécessaire. | Équipe, coordination Wissame |
| Schéma disponible seulement sur une machine | Scripts/fixtures versionnés, migration sur copie fictive, instructions reproductibles. | Lamia |
| Anciennes activités sans propriétaire | Conservation sans attribution arbitraire, exclusion des historiques personnels ; nouvelle propriété obligatoire côté service. | Lamia et Wissame |
| Fuite lors du changement de compte | Filtrage backend, DTO minimaux, nettoyage React et annulation des requêtes ; scénario A/B. | Wissame et Meriem |
| Contrat frontend/backend divergent | Contrat/exemples communs lors de la planification, raccordement tôt, erreurs cohérentes. | Toute l'équipe |
| Extension aux données physiologiques/calories | Report jusqu'à besoin confirmé, finalité/méthode et protections définies ; seulement données fictives de test. | PO et équipe |
| Totaux/graphique incohérents | Même contrat de filtres et bornes, jeu fixe multi-semaines, comparaison SQL/API/interface avant démo. | Toute l'équipe |
| Vacances assimilées à capacité garantie | Confirmer les heures de chacune ; suivre les jalons du 20 et du 25 octobre et réestimer. | Toute l'équipe |
| Trop d'options avant livraison | Stopper les Could Have si réserve utilisée ; geler les ajouts le 29 octobre et préserver la vérification finale. | Wissame et équipe |

## 13. Validation préalable attendue

Avant développement, confirmer : exigences du PO, disponibilité de chaque membre, cible enrichie et priorités, contrat API/propriété/filtres/semaines et Definition of Done. La séance du 2 novembre est renseignée selon l'équipe ; les dates suivantes restent à préciser. Le présent document fournit une proposition concrète à examiner ; la demande d'enrichissement de documentation ne constitue pas une demande de commencer le code. Aucune branche, aucun commit ni push n'est créé pour cette révision.
