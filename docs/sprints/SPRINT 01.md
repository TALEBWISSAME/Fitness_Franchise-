# Sprint 1 — Mise en place du socle technique et validation du premier flux

## Université d'Avignon — CERI
### Master 1 Informatique
### Module : Processus du développement logiciel
### Projet : Fitness Franchise

---

## Équipe de développement

| Membre | Rôle |

| Taleb Wissame | Scrum Master / Developer |
| Taleb Lamia | Developer |
| Meriem Takdjerad | Developer |

**Product Owner :** SUCAL VIRGILE 

---

## Informations du Sprint

- **Sprint :** Sprint 1
- **Date de début :** 05 octobre 2026
- **Date de fin :** 13 octobre 2026
- **Durée :** 1 semaine
- **Équipe :** 3 développeurs

### Sprint Goal

> Mettre en place le socle technique de Fitness Franchise et valider son
> fonctionnement de bout en bout par la transmission et le traitement
> d'une première activité sportive simulée.

---

# Sommaire

1. Contexte du Sprint
2. Sprint Goal et résultat attendu
3. Choix du périmètre du Sprint
4. Architecture technique initiale
5. User Stories sélectionnées
6. Tâches du Sprint
7. Répartition des tâches
8. Estimation et budget temps
9. Dépendances entre les tâches
10. Critères d'acceptation
11. Definition of Done
12. Risques et points de vigilance
13. Incrément attendu
14. Résultat obtenu
15. Sprint Review — Retour du Product Owner
16. Rétrospective du Sprint


## 1. Contexte du Sprint

Ce premier sprint marque le démarrage du développement de notre application
**Fitness Franchise**.

À la suite de nos premiers échanges avec le Product Owner, nous avons identifié
comme besoin central la création d'une application destinée à une franchise
de salles de sport. Notre application devra notamment permettre le suivi des
activités physiques des adhérents et l'intégration, à terme, des équipements
sportifs disponibles dans les salles de la franchise.

Au début de ce sprint, nous partons d'un projet encore vierge sur le plan
technique : le frontend, le backend et la base de données ne sont pas encore
initialisés. Nous avons cependant déjà mis en place notre dépôt GitHub ainsi
que l'organisation Scrum qui nous permettra de suivre l'avancement du projet.

Pour ce premier sprint, nous souhaitons donc construire les premières
fondations techniques de l'application tout en réalisant un premier flux
simple et fonctionnel.

Nous allons mettre en place le frontend, le backend et la base de données,
puis vérifier leur intégration à travers un premier cas lié au cœur de notre
produit : la transmission d'une activité sportive simulée vers notre
application.

Nous avons volontairement limité le périmètre de ce premier sprint afin
qu'il soit réalisable par notre équipe de trois développeurs en une semaine.
Notre objectif est d'obtenir à la fin du sprint un premier résultat intégré,
fonctionnel et démontrable au Product Owner.

## 2. Sprint Goal et résultat attendu

### 2.1 Sprint Goal

Pour ce premier sprint, notre objectif est de mettre en place le socle
technique minimal de l'application **Fitness Franchise** et de vérifier
que les différents composants peuvent communiquer correctement entre eux.

Nous souhaitons également valider ce socle à travers un premier flux simple
lié au cœur de notre application : transmettre les données d'une activité
sportive simulée vers notre backend et assurer leur traitement minimal.

Notre Sprint Goal est donc :

> **Mettre en place le socle technique de Fitness Franchise et valider son
> fonctionnement de bout en bout par la transmission et le traitement
> d'une première activité sportive simulée.**

### 2.2 Résultat attendu à la fin du Sprint

À la fin de ce sprint, nous souhaitons disposer d'une première version
technique exécutable de notre projet.

Nous devons être capables de démontrer que :

- notre frontend est initialisé et peut être exécuté ;
- notre backend est initialisé et opérationnel ;
- notre base de données est configurée et accessible depuis le backend ;
- une première API liée aux activités sportives est disponible ;
- une activité sportive fictive peut être envoyée afin de simuler les
  données provenant d'un équipement sportif ;
- notre backend est capable de recevoir et de traiter cette activité ;
- les différents composants développés peuvent fonctionner ensemble.

Le premier flux que nous souhaitons valider est donc :

**Équipement simulé → API → Backend → Base de données**

Ce premier incrément constituera la base technique sur laquelle nous
construirons progressivement les fonctionnalités métier lors des prochains
sprints.



## 3. Choix du périmètre du Sprint

Pour ce premier sprint, nous avons choisi de nous concentrer sur la mise en
place du socle technique de l'application et sur la validation d'un premier
flux fonctionnel.

Comme nous partons d'un projet encore vierge techniquement et que notre équipe
est composée de trois développeurs, nous avons volontairement limité le nombre
de fonctionnalités à réaliser pendant cette première semaine.

### 3.1 Éléments inclus dans le Sprint 1

Pendant ce sprint, nous prévoyons de :

- définir et mettre en place l'architecture technique initiale du projet ;
- initialiser le frontend de l'application ;
- initialiser le backend et mettre en place une première API REST ;
- configurer une base de données et établir la communication avec le backend ;
- définir un modèle minimal pour représenter une activité sportive ;
- mettre en place un premier endpoint permettant de recevoir une activité ;
- simuler l'envoi d'une activité provenant d'un équipement sportif ;
- vérifier le fonctionnement du flux complet entre les différents composants ;
- réaliser les premiers tests nécessaires à la validation de ce flux ;
- documenter l'installation et les choix techniques réalisés.


## 4. Architecture technique initiale

Pour démarrer le développement, nous avons choisi une architecture séparant
l'interface utilisateur, la logique métier, le stockage des données et la
simulation des équipements sportifs.

Notre architecture initiale est organisée de la manière suivante :

**Frontend → API REST → Backend → Base de données**

Un composant supplémentaire sera utilisé pour simuler la communication avec
un équipement sportif :

**Équipement simulé → API REST → Backend → Base de données**

### 4.1 Frontend — React

Nous envisageons d'utiliser **React** pour développer l'interface web de
l'application.

Le frontend sera responsable de l'affichage et des interactions avec
l'utilisateur. Il communiquera avec le backend à travers l'API REST.

Nous avons retenu React notamment pour :

- construire l'interface à partir de composants réutilisables ;
- séparer clairement l'interface utilisateur de la logique du backend ;
- faciliter l'évolution progressive de l'application au cours des sprints.

Dans ce premier sprint, notre objectif concernant le frontend reste limité :
initialiser correctement le projet et vérifier sa communication avec le backend.


### 4.2 Backend — Java / Spring Boot

Nous envisageons d'utiliser **Java avec Spring Boot** pour développer le
backend de l'application.

Le backend aura pour rôle de recevoir les requêtes provenant du frontend
et des équipements, d'appliquer la logique métier et de communiquer avec
la base de données.

Nous avons retenu Spring Boot notamment pour :

- développer des API REST de manière structurée ;
- organiser le backend en différentes responsabilités ;
- faciliter la communication avec une base de données ;
- disposer d'une architecture pouvant évoluer avec les fonctionnalités
  ajoutées lors des prochains sprints.

Pour le Sprint 1, nous mettrons principalement en place le projet backend
et une première API liée aux activités sportives.


### 4.3 Base de données — PostgreSQL

Nous envisageons d'utiliser **PostgreSQL** comme système de gestion de base
de données relationnelle.

La base de données permettra de conserver les informations nécessaires au
fonctionnement de l'application.

Pour ce premier sprint, nous limiterons volontairement notre modèle aux
données nécessaires pour tester le premier flux d'activité sportive.

Nous avons retenu PostgreSQL notamment pour :

- disposer d'une base de données relationnelle robuste ;
- représenter les relations entre les futures entités de l'application ;
- assurer une intégration adaptée avec notre backend.


### 4.4 API REST

La communication entre les différents composants reposera sur une
**API REST** exposée par notre backend.

Cette API constituera le point de communication entre :

- le frontend et le backend ;
- les équipements simulés et le backend.

Dans le Sprint 1, nous mettrons en place un premier endpoint permettant
de transmettre une activité sportive simulée au backend.


### 4.5 Simulateur d'équipement

Nous prévoyons de développer un simulateur simple représentant un équipement
sportif, par exemple un tapis de course.

Ce simulateur permettra d'envoyer des données fictives d'activité vers notre
API sans avoir besoin de disposer d'un véritable équipement connecté.

Il nous permettra ainsi de valider dès le début du projet le principe
d'intégration entre les équipements sportifs et notre application.


### 4.6 Vue globale

Notre architecture initiale peut être représentée ainsi :

                     FRONTEND
                       React
                         |
                         |
                      API REST
                         |
                         v
                  BACKEND SPRING BOOT
                         |
                         |
                         v
                     PostgreSQL
                         ^
                         |
                      API REST
                         |
               ÉQUIPEMENT SIMULÉ







      ## 5. User Stories sélectionnées

Pour ce premier sprint, nous avons sélectionné un nombre limité de User Stories.
Notre priorité est de valider le premier flux lié au cœur de Fitness Franchise,
tout en mettant en place le socle technique nécessaire à son fonctionnement.

### US1 — Transmission d'une activité sportive

> **En tant qu'adhérent, je veux que les données de mon activité réalisée sur
> un équipement sportif puissent être transmises à l'application afin que
> mon activité puisse être prise en compte par le système.**

Cette User Story représente le premier besoin métier que nous souhaitons
valider. Dans ce sprint, nous utiliserons un équipement simulé afin de tester
la transmission des données sans dépendre d'un équipement physique réel.


### US2 — Enregistrement d'une activité sportive

> **En tant qu'adhérent, je veux que mon activité sportive transmise à
> l'application soit enregistrée afin qu'elle puisse être exploitée
> ultérieurement pour le suivi de mes entraînements.**

Cette deuxième User Story nous permet de vérifier que les données reçues
ne sont pas seulement transmises au backend, mais qu'elles peuvent également
être conservées dans notre système.


### Parcours couvert par les User Stories

Les deux User Stories nous permettent de valider le parcours suivant :

**Équipement simulé → transmission de l'activité → API → traitement par le backend → enregistrement en base de données**




## 6. Tâches du Sprint

À partir du Sprint Goal et des User Stories sélectionnées, nous avons découpé
le travail en plusieurs tâches techniques.

Nous avons choisi des tâches suffisamment précises pour pouvoir suivre leur
avancement individuellement sur notre GitHub Project.

### T1 — Valider l'architecture et les technologies du projet

Nous allons valider l'organisation technique initiale de l'application :

- React pour le frontend ;
- Spring Boot / Java pour le backend ;
- PostgreSQL pour la base de données ;
- API REST pour les communications ;
- un simulateur pour représenter un équipement sportif.

Nous définirons également la manière dont ces différents composants
communiqueront entre eux.

**Objectif :** disposer d'une architecture commune avant de commencer le
développement et éviter que chaque membre développe une partie incompatible
avec les autres.


### T2 — Initialiser le backend Spring Boot

Nous allons créer le projet Spring Boot et ajouter uniquement les dépendances
nécessaires au démarrage du Sprint 1.

Nous vérifierons que :

- le projet compile correctement ;
- le serveur démarre ;
- un premier endpoint de test répond correctement ;
- la structure initiale du backend est claire.

**Objectif :** disposer d'un backend fonctionnel sur lequel nous pourrons
construire l'API des activités sportives.


### T3 — Initialiser le frontend React

Nous allons créer le projet frontend React et préparer une structure minimale
pour les futurs composants et pages de l'application.

Nous vérifierons que :

- le projet peut être installé ;
- l'application démarre correctement ;
- une première page peut être affichée.

**Objectif :** disposer dès le premier sprint d'une base frontend fonctionnelle
qui pourra être enrichie progressivement.


### T4 — Configurer PostgreSQL et la connexion au backend

Nous allons mettre en place la base de données PostgreSQL et configurer sa
connexion avec Spring Boot.

Nous vérifierons que le backend peut se connecter correctement à la base
de données.

**Objectif :** disposer d'un stockage persistant nécessaire pour enregistrer
les premières activités sportives.


### T5 — Créer le modèle minimal d'une activité sportive

Nous allons définir la première représentation d'une activité sportive dans
notre backend et notre base de données.

Pour le Sprint 1, nous conserverons uniquement les informations nécessaires
au test du premier flux, par exemple :

- identifiant de l'activité ;
- type d'équipement ;
- durée ;
- distance si elle est applicable ;
- date de l'activité.

Nous éviterons d'ajouter dès maintenant des informations qui ne sont pas
nécessaires à notre Sprint Goal.

**Objectif :** disposer d'une structure claire permettant de représenter et
d'enregistrer une première activité sportive.


### T6 — Développer l'API de réception d'une activité

Nous allons créer un premier endpoint REST permettant au backend de recevoir
les données d'une activité sportive.

Nous vérifierons notamment que :

- les données envoyées sont reçues ;
- les données nécessaires sont correctement interprétées ;
- une requête valide produit une réponse correcte ;
- l'activité peut être transmise au mécanisme d'enregistrement.

**Objectif :** mettre en place le premier véritable point d'entrée métier
de notre application.


### T7 — Développer un simulateur minimal d'équipement

Nous allons créer un simulateur simple représentant un premier équipement
sportif, par exemple un tapis de course.

Le simulateur générera une activité fictive et l'enverra à l'API REST.

Exemple de données simulées :

- équipement : tapis de course ;
- durée : 30 minutes ;
- distance : 4 km ;
- date de l'activité.

**Objectif :** tester le principe de communication avec un équipement sportif
sans dépendre d'une machine physique réelle.


### T8 — Intégrer et tester le premier flux complet

Une fois les différents composants disponibles, nous allons les intégrer et
tester le parcours complet :

**Équipement simulé → API REST → Backend → PostgreSQL**

Nous vérifierons qu'une activité envoyée par le simulateur arrive jusqu'au
backend et peut être enregistrée dans la base de données.

**Objectif :** vérifier que les composants développés séparément fonctionnent
correctement ensemble et que le Sprint Goal est réellement atteint.


### T9 — Documenter l'installation et préparer la démonstration

Nous allons documenter les éléments nécessaires pour lancer le projet :

- prérequis ;
- lancement du frontend ;
- lancement du backend ;
- configuration de la base de données ;
- lancement du simulateur ;
- procédure permettant de reproduire le premier flux.

Nous préparerons également un scénario court pour présenter l'incrément au
Product Owner lors de la prochaine séance.

**Objectif :** permettre à chaque membre de l'équipe de lancer le projet et
disposer d'un incrément reproductible et démontrable.


## 7. Répartition des tâches et budget temps

Pour ce premier sprint, nous sommes trois développeurs et nous disposons
d'une semaine.

Nous avons estimé chaque tâche en fonction de sa complexité, de ses dépendances
et du travail nécessaire pour obtenir un premier incrément fonctionnel.

Les durées indiquées constituent notre budget prévisionnel. Elles pourront
être comparées au temps réellement consacré à chaque tâche à la fin du sprint.

| ID | Tâche | Responsable | Budget estimé |
|----|-------|-------------|----------------|
| T1 | Valider l'architecture et les technologies | Toute l'équipe | 1 h |
| T2 | Initialiser le backend Spring Boot | Wissame | 1 h |
| T3 | Initialiser le frontend React | Lamia | 1 h |
| T4 | Configurer PostgreSQL et la connexion au backend | Meriem | 1 h 30 |
| T5 | Créer le modèle minimal d'une activité sportive | Meriem | 1 h |
| T6 | Développer l'API de réception d'une activité | Wissame | 2 h |
| T7 | Développer le simulateur minimal d'équipement | Lamia | 1 h 30 |
| T8 | Intégrer et tester le premier flux complet | Toute l'équipe | 2 h |
| T9 | Documenter l'installation et préparer la démonstration | Toute l'équipe | 1 h |

**Budget total prévisionnel du Sprint 1 : 12 heures-personnes.**
