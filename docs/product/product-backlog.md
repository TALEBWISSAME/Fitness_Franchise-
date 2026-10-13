# Fitness Franchise — Product Backlog priorisé

Date : 13 octobre 2026. **Statut : proposition non validée par le Product Owner.** Les décisions et résultats réels seront renseignés après les échanges ; aucune ligne future n'est « Done ».

Révision du même jour : l'équipe indique une prochaine séance le **2 novembre 2026** et demande un Sprint 2 plus riche pendant cette période de préparation. Les totaux, filtres et graphique simple passent dans le Must Have du Sprint 2 ; l'objectif hebdomadaire devient Should Have. Cette révision ne commence aucun développement.

Révision des estimations : l'équipe indique que le professeur autorise l'usage des LLM. Le Sprint 2 est réestimé à **37,5 h-personnes de travail, objectif compris, plus 7 h de réserve**. Cette prévision optimiste suppose réutilisation du socle et assistance efficace ; elle inclut compréhension, relecture, intégration et tests. Les charges indicatives des sprints suivants restent à réestimer à partir du temps réellement observé.

## 1. Références et règles

Le [catalogue fonctionnel](catalogue-fonctionnalites.md) est la source de l'analyse, des preuves d'implémentation et de la distinction entre intentions historiques et propositions. Le [Sprint 1](../sprints/sprint1.md) reste intact : US1 et US2 sont conservées sous PB-00. Aucun backlog formalisé n'a été trouvé dans le dépôt ni dans la recherche d'issues ; ce document constitue une proposition initiale, pas le remplacement d'exigences externes.

Origines : **S1** = objectif/US du Sprint 1 ; **R** = README/roadmap initiale, fonctionnalités envisagées ; **U** = suggestions actuelles de l'équipe ; **C** = proposition du conseiller. Aucune origine R/U/C ne signifie « exigence obligatoire du professeur ». Lorsque le cahier des charges sera disponible, ajouter ses références et ajuster l'ordre avec le PO.

Priorités proposées : **Must Have** = nécessaire au parcours retenu ou à sa qualité ; **Should Have** = utile après réalisation du noyau ; **Could Have** = option sous réserve de capacité. Les éléments reportés restent dans le backlog. Le PO arbitre l'ordre produit et les développeuses construisent le plan de réalisation ; Wissame facilite la coordination. Ces responsabilités suivent le [Scrum Guide](https://scrumguides.org/scrum-guide.html).

## 2. Ordre proposé

L'ordre est indicatif : les tâches de qualité sont intégrées à chaque incrément et ne sont pas reportées à la fin.

| ID | Besoin / résultat utilisateur | Origine | État observé | Priorité proposée | Dépendances | Horizon proposé |
|---|---|---|---|---|---|---|
| PB-00 | Transmettre et enregistrer une séance simulée (US1/US2 conservées), puis consulter la liste et le détail. | S1/R | Code présent ; API/service testés ; flux PostgreSQL confirmé manuellement par l'équipe ; pas de test complet automatisé réussi attesté. | Socle à préserver | Aucune | Sprint 1, état détaillé dans le catalogue |
| PB-01 | Recréer la base et les données fictives de démonstration à partir de fichiers versionnés, sans perdre les anciennes séances. | C/N-U | Non développé ; scripts SQL absents. | Must Have S2 | PB-00, contrat de données | S2 |
| PB-02 | En tant que nouvel adhérent, créer mon compte avec email, mot de passe et nom d'affichage. | R/U | Non développé | Must Have S2 enrichi | PB-01, PB-03 | S2 ; différé en repli |
| PB-03 | Me connecter, retrouver ma session et me déconnecter ; refuser les accès non authentifiés. | R/U | Non développé | Must Have S2 | PB-01 | S2 |
| PB-04 | Consulter mon profil minimal sans données physiologiques. | U | Non développé | Must Have S2 enrichi | PB-03 | S2 ; nom seul en repli |
| PB-05 | Recevoir une séance associée au compte authentifié du simulateur, sans faire confiance à un ID adhérent fourni par le client. | U/C | Association absente du modèle actuel | Must Have S2 | PB-01, PB-03 | S2 |
| PB-06 | Consulter uniquement mes activités, y compris leurs détails, et vérifier l'isolation entre deux adhérents. | R/U/C | Liste globale existante, suivi personnel absent | Must Have S2 | PB-03, PB-05 | S2 |
| PB-07 | Disposer d'un parcours testé, d'un contrat d'API et d'une démonstration reproductible ; connaître les limites des résultats. | S1/U/C | Tests backend présents ; documentation et couverture partielles | Must Have transversal | Chaque fonctionnalité retenue | Chaque sprint |
| PB-08 | Voir mon nombre de séances, ma durée totale et ma distance totale pour la période sélectionnée. | R/U | Non développé | Must Have S2 | PB-06, contrat filtres | S2 |
| PB-09 | Modifier mon nom d'affichage depuis mon profil ; email/mot de passe nécessitent un traitement distinct. | U | Non développé | Could Have S2, sinon Should S3 | PB-04 | S2 option / S3 |
| PB-10 | Filtrer mes séances par dates et type d'équipement, sans changer leur propriétaire. | U | Non développé | Must Have S2 | PB-06, convention de dates | S2 |
| PB-11 | Voir l'évolution hebdomadaire de mes séances et comparer deux périodes personnelles. | R/U | Non développé | Must Have S2 pour graphique simple ; comparaison reportée | PB-08, PB-10 | Graphique S2 ; comparaison après |
| PB-12 | Définir un objectif hebdomadaire de nombre de séances et voir sa progression. | R/U | Non développé | Should Have S2 | PB-08, définition semaine/jour | S2 visé ; reprise ensuite si reporté |
| PB-13 | Administrer un minimum de deux salles et les identifier dans le produit. | R/U | Non développé | Must Have S3 si confirmé | PB-03, PB-15 | S3 |
| PB-14 | Administrer les équipements d'une salle et relier une séance à un équipement identifié. | R/U | Non développé | Must Have S3 si confirmé | PB-13, PB-15, PB-05 | S3 |
| PB-15 | Réserver les actions d'administration au rôle admin, consulter les comptes, bloquer/réactiver un adhérent. | R/U | Non développé | Rôle Must S3 ; blocage Should | PB-03, tests d'autorisation | S3 |
| PB-16 | Relier un adhérent à une salle d'inscription tout en précisant sa possibilité de pratiquer ailleurs. | R/U | Non développé | Should Have | PB-13, décision PO sur mobilité | S3 option / après |
| PB-17 | Simuler un vélo d'appartement puis un elliptique avec des données et règles adaptées. | R/U | Tapis uniquement | Should Have pour vélo, Could pour elliptique | PB-14, types/units validés | S3 option / après |
| PB-18 | Voir mes jours actifs par semaine ; calculer ensuite les séries et autres indicateurs d'assiduité. | R/U | Non développé | Should Have pour jours actifs | PB-06, PB-11 | S4 / après |
| PB-19 | Renseigner uniquement les mesures physiologiques nécessaires à une finalité confirmée. | U | Non développé | Reporté à validation | PB-03, PB-28, besoin PO | Après le noyau |
| PB-20 | Conserver l'historique de mes mesures et mes objectifs physiques. | U | Non développé | Reporté | PB-19 | Après |
| PB-21 | Calculer un IMC avec unités correctes et limites explicites, si demandé. | U | Non développé | Reporté | PB-19, cadrage méthode/public | Après |
| PB-22 | Estimer les calories et leurs statistiques selon une méthode sourcée, des données pertinentes et des hypothèses visibles. | R/U | Non développé | Reporté | PB-19 si poids requis, intensité/types, validation méthode | Après |
| PB-23 | Définir des objectifs de distance/durée/fréquence avec progression et atteinte. | R/U | Non développé | Should Have après objectif simple | PB-12, PB-08 | Après |
| PB-24 | Recevoir un badge « première séance », puis badges de distance et régularité. | R/U | Non développé | Could Have S2 pour première séance | PB-06 ; PB-18 pour régularité | Première séance S2 option ; autres après |
| PB-25 | Participer à des défis et cumuler points/récompenses. | R/U | Non développé | Reporté | PB-24, règles métier PO | Après |
| PB-26 | Consulter des statistiques par salle et une vue globale autorisée de la franchise. | R/U | Non développé | Should Have après gestion des salles | PB-13, PB-14, PB-15 | S3/S4 option / après |
| PB-27 | Voir un message d'objectif/badge atteint ; recevoir éventuellement rappels et informations. | U | Non développé | Message objectif inclus dans Should S2 ; rappels reportés | PB-12 ou PB-24 | S2 pour objectif ; suite après |
| PB-28 | Définir confidentialité, finalités, conservation, information et portée de suppression/export attendue. | R/U | Non développé ; CORS n'est pas une politique de confidentialité | Cadrage Must ; réalisation selon exigences confirmées | Besoins PO ; identité/propriété pour droits | Cadrage S2, suite à arbitrer |
| PB-29 | Exécuter des vérifications reproductibles en CI. | U | Aucun workflow présent | Could Have | Lancement reproductible, tests sans secrets réels | S3/S4 option |
| PB-30 | Explorer les besoins de nutrition et autres objectifs complémentaires. | R | Envisagé seulement | Reporté | Cadrage PO | Après |
| PB-31 | Renvoyer une séance sans doublonner grâce à un identifiant externe unique. | C | Non développé | Should Have avant équipements autonomes | PB-05, migration et gestion des conflits | S3/S4 option |
| PB-32 | Exporter mon historique personnel en CSV avec unités et dates. | C | Non développé | Could Have S2 | PB-06, PB-10, contrôle propriétaire | S2 option ; reprise après si reporté |
| PB-33 | Définir une représentation des instants/fuseaux cohérente pour l'usage dans plusieurs salles. | C | `LocalDateTime` sans fuseau ; convention absente | Convention Must S2 ; migration selon besoin | Décision produit, migration données existantes | S2 cadrage / suite |

Les détails de recherche textuelle, classement entre personnes, points, défis, notifications externes et nutrition sont conservés comme pistes et ne sont pas ajoutés au Sprint 2. Une exigence formelle pourra changer leur priorité.

## 3. Critères d'acceptation produit des éléments proches

| Élément | Critères proposés pour pouvoir le déclarer terminé |
|---|---|
| PB-01 | Une base de test vide peut être initialisée ; une base contenant des séances du Sprint 1 peut être migrée sans perte ; les séances sans propriétaire restent explicitement non attribuées et invisibles aux historiques personnels ; aucune donnée réelle dans les fixtures. |
| PB-02 | Compte valide créé avec email unique et nom ; doublon ou données invalides refusés ; mot de passe haché, jamais renvoyé ni journalisé ; aucune élévation de rôle fournie par le client. |
| PB-03 | Bon identifiant accepté, mauvais refusé ; session maintenue et invalidée à la déconnexion ; API privée inaccessible sans session ; traitement CSRF testé pour les écritures. |
| PB-04 | Le profil correspond au compte connecté, sans hash/mot de passe ni données d'autrui ; états chargement/erreur pris en charge. |
| PB-05/PB-06 | Deux comptes A/B génèrent des séances distinctes ; chaque GET ne retourne que les séances du compte ; usurpation d'ID client impossible ; changement de compte efface les anciennes données de l'interface ; toutes les validations du Sprint 1 restent actives. |
| PB-07 | Tests significatifs exécutés avec résultat consigné, compilation React, preuve PostgreSQL sur données fictives, scénario A/B et documentation de lancement à jour. Une étape ignorée reste signalée. |
| PB-08 | Compte vide : trois totaux nuls ; les totaux correspondent aux séances du compte et aux filtres actifs, excluent celles d'un autre compte et sont vérifiés sur un jeu fixe. |
| PB-10/PB-11 | Bornes de périodes documentées ; seules les séances personnelles sont filtrées/agrégées ; semaines vides affichées à zéro ; graphique cohérent avec les totaux. |
| PB-12 | Objectif de 1 à 14 séances, semaine de référence explicite, unicité compte/semaine, progression personnelle et atteinte visible ; zéro et dépassement testés. La semaine courante est indépendante des filtres historiques. |
| PB-13/PB-14/PB-15 | Deux salles et leurs équipements identifiables ; relation salle-équipement persistée ; seul un admin peut modifier ; activité reliée à un équipement valide ; suppression d'un équipement déjà utilisé bloquée ou archivage clairement défini. |

## 4. Ordre pour les trois séances restantes

La prochaine séance est le **2 novembre 2026**, selon l'équipe : la préparation démarre le 13 octobre, soit 20 jours calendaires. Les heures réellement disponibles de chacune et les dates des deux séances suivantes restent à confirmer. Ne pas assimiler vacances et capacité garantie ; les travaux doivent être intégrés et vérifiés avant la revue.

| Rendez-vous restant | Incrément cible | Noyau à sélectionner | Options à couper en premier | Preuve à présenter |
|---|---|---|---|---|
| 1 — Revue Sprint 2, 2 novembre | L'adhérent suit ses entraînements dans un espace personnel avec indicateurs et graphique. | PB-01 à PB-08, PB-10 et graphique PB-11 ; objectif PB-12 en Should. | Badge, CSV, modification du nom puis objectif ; repli et Sprint Goal réduit à négocier si le Must ne peut être terminé. | Démo A/B, séance, filtres, totaux et graphique concordants avec la base, tests et écarts de planification. |
| 2 — Revue Sprint 3, date à confirmer | La franchise possède des salles/équipements et des droits adaptés. | Rôle admin PB-15, PB-13/PB-14 minimaux, régressions du suivi personnel. | Blocage avancé, vélo, statistiques globales. Si capacité limitée, périmètre salles/équipements réduit à annoncer explicitement. | Deux salles, équipement associé, séance rattachée, accès autorisé/refusé et indicateurs préservés. |
| 3 — Revue Sprint 4 / bilan, date à confirmer | Suivi, franchise et engagement forment un produit vérifié. | Reprendre les objectifs/badges reportés, jours actifs si retenus, régression et livraison documentée. | Défis, badges nombreux, notifications externes et autres ajouts tardifs. | Parcours complet, règles métier, preuves de qualité, bilan estimé/réel, feedback appliqué et limites restantes. |

Ordres de grandeur pour la suite, à réestimer après le Sprint 2 :

| Incrément | Wissame — backend/Scrum | Meriem — React | Lamia — base/simulateur | Charge indicative hors options |
|---|---|---|---|---|
| Sprint 3 | Droits admin, API salles/équipements et tests : 8–11 h ; coordination : 2 h. | Vue salles/équipements et administration minimale : 6–8 h ; intégration/QA : 2 h. | Tables/contraintes, migrations, fixtures et ID équipement dans le simulateur : 5–7 h ; vérification : 2 h. | 25–32 h-personnes ; environ 6 h-personnes de réserve en plus. |
| Sprint 4 | Régularité/objectif simple/badge retenus et tests : 5–7 h ; bilan/livraison : 2 h. | Affichages métier retenus et finitions : 5–7 h ; QA/démo : 2 h. | Fixtures/règles, SQL et reproductibilité : 3–6 h ; vérification : 2 h. | 19–26 h-personnes ; environ 5 h-personnes de réserve en plus. Réestimer selon les items déjà livrés en S2. |

Ces charges sont des prévisions, pas une promesse compatible avec une capacité encore inconnue. Si la capacité totale est inférieure, réduire les incréments ou demander au PO de choisir entre progression et administration. Si le cahier des charges impose physiologie/calories ou administration dès maintenant, réordonner le backlog ; ne pas empiler ces fonctions sur le Sprint 2 actuel.

## 5. Risques et décisions de planification

- **Capacité inconnue et backend chargé :** comparer les heures disponibles de chacune aux estimations, pas seulement le total équipe ; ne pas considérer les 12 heures prévisionnelles du Sprint 1 comme une vélocité réalisée.
- **Exigences absentes :** valider les priorités avec le professeur avant développement. Garder une référence pour chaque décision.
- **Sessions/CSRF/CORS et simulateur :** tester un aller-retour authentifié tôt ; pas de session inventée, de mot de passe en clair dans la base ou de désactivation globale des protections pour gagner du temps.
- **Anciennes activités sans propriétaire :** conserver leur caractère non attribué jusqu'à une décision explicite ; ne pas les affecter arbitrairement à une adhérente.
- **Données et preuves :** bases/fixtures fictives, comptes A/B distincts ; un test mocké ne remplace pas une preuve PostgreSQL.
- **Fin de projet :** la dernière séance comprend la livraison, la régression et le bilan ; les options ne doivent pas consommer cette réserve.

## 6. Suivi Scrum à mettre en place après validation

Créer/mettre à jour le suivi réel des items sélectionnés : À faire → En cours → À vérifier → Terminé. Associer à chaque item ses critères, tâches, responsable de réalisation et preuve ; limiter le travail simultané. Consigner estimé/réel, blocages et décisions du PO. Ne pas mettre un item « Terminé » parce que sa page est dessinée.

À chaque revue : démontrer les items qui respectent la Definition of Done, recueillir le retour, noter les éléments non terminés puis ajuster le backlog. À la rétrospective : choisir une amélioration concrète et vérifier au rendez-vous suivant son application. Le [Sprint 2](../sprints/SPRINT%2002.md) décrit les tâches et les preuves prévues ; il n'autorise pas le démarrage du code avant validation de l'équipe.
