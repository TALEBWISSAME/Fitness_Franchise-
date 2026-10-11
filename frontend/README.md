## Frontend — Sprint 1

**Développement : Meriem Takdjerad**

Dans le cadre du Sprint 1 du projet Fitness Franchise, nous avons initialisé et développé une première interface web avec **React, JavaScript, Vite et CSS**.

### Fonctionnalités réalisées

- Mise en place d'une interface responsive avec un thème sombre et orange.
- Création de la page **Accueil** avec une bannière de bienvenue.
- Ajout d'un menu latéral pour naviguer entre **Accueil** et **Activités**.
- Création des cartes **État du système**, **Équipement simulé** et **Dernière activité sportive**.
- Création de la page **Activités** avec un tableau de présentation.
- Ajout d'une fenêtre modale pour afficher les détails d'une activité sportive.
- Ajout d'une fenêtre modale pour présenter un test de connexion à l'API.

### État actuel

L'interface est fonctionnelle côté frontend. Les activités affichées et la réponse du test API sont actuellement des **données de démonstration**.

La connexion réelle à l'API REST Spring Boot et la récupération des données depuis PostgreSQL restent à intégrer et à valider avec l'équipe.

### Lancement du frontend

Prérequis : Node.js et npm.

```bash
cd frontend
npm install
npm run dev
```

Ouvrir ensuite l'adresse locale indiquée par Vite dans le terminal.

### Vérification

La compilation de production a été testée avec succès :

```bash
npm run build
```