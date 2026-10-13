
## Planification prévisionnelle des Sprints

Notre projet est organisé en cinq Sprints. Nous avons défini une première
roadmap afin de construire progressivement l'application, depuis son socle
technique jusqu'à sa livraison finale.

Cette planification représente notre vision initiale du développement.
Elle pourra évoluer en fonction de l'avancement du projet et des retours
du Product Owner.

| Sprint | Titre | Durée |
|--------|-------|-------|
| Sprint 1 | Socle technique et premier flux d'activité connectée | 1 semaine |
| Sprint 2 | Gestion des adhérents et authentification | 1 semaine |
| Sprint 3 | Suivi des activités et de la progression | 1 semaine |
| Sprint 4 | Administration et engagement des adhérents | 1 semaine |
| Sprint 5 | Finalisation, sécurité et livraison du produit | 1 semaine |

## Révision de la planification — trois séances restantes

Le tableau ci-dessus est conservé comme vision initiale. Au 13 octobre 2026,
l'équipe indique trois séances restantes, avec la prochaine le **2 novembre
2026**, et demande un Sprint 2 enrichi pendant cette période de préparation.
La suite proposée ne suppose pas un Sprint 5 supplémentaire ; les heures
disponibles de chacune et les dates suivantes restent à confirmer avec les
exigences du Product Owner.

| Séance restante | Incrément proposé | Preuve principale |
|---|---|---|
| 1 — Sprint 2, 2 novembre 2026 | Espace adhérent, historique, tableau de bord, filtres et graphique hebdomadaire ; objectif en Should | Deux comptes A/B, jeu multi-semaines, isolation et cohérence SQL/API/interface |
| 2 — Sprint 3, date à confirmer | Salles/équipements identifiés, droits admin minimaux et activité rattachée | Deux salles, équipement rattaché, accès autorisé/refusé et suivi personnel préservé |
| 3 — Sprint 4 / bilan, date à confirmer | Régularité/objectif ou badge reportés, consolidation, régression et documentation finale | Parcours intégré, règles métier vérifiées, preuves de qualité et bilan Scrum |

Le Sprint 2 est préparé du 13 octobre au 2 novembre, soit une fenêtre de
20 jours calendaires, sans supposer 20 jours de travail par développeuse.
Le plan révisé avec assistance LLM vise 37,5 h-personnes plus 7 h de réserve ; les Could Have demandent
une capacité supplémentaire. Les jours du 29 octobre au 1 novembre sont
réservés aux vérifications, corrections et répétitions de démonstration.
Ces estimations optimistes incluent la compréhension, la relecture, l'intégration
et les tests des propositions générées. Elles restent à confronter au temps réel.

Documents de référence, sans réécriture du Sprint 1 :

- [Sprint 1 existant](sprint1.md).
- [Catalogue fonctionnel et état du dépôt](../product/catalogue-fonctionnalites.md).
- [Product Backlog priorisé proposé](../product/product-backlog.md).
- [Sprint 2 détaillé, complet ou réduit](SPRINT%2002.md).
- [Vérifications et limites des preuves](../tests/README.md).
