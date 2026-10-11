# Backend — Sprint 1

Prérequis : JDK 21 et accès Internet lors du premier lancement du Maven Wrapper.
Maven 3.9.11 est téléchargé automatiquement ; aucune installation Maven séparée
n'est nécessaire.

Depuis PowerShell, avec un JDK 21 installé (adapter uniquement son chemin) :

```powershell
Set-Location 'C:\Users\taleb\Desktop\Fitness_Franchise-\backend'
$env:JAVA_HOME = 'C:\chemin\vers\jdk-21'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
java -version
.\mvnw.cmd clean verify
.\mvnw.cmd spring-boot:run
```

Dans un second terminal PowerShell :

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/health' | ConvertTo-Json
```

Réponse HTTP 200 attendue :

```json
{
  "status": "UP",
  "message": "Fitness Franchise API is running"
}
```

Arrêter le serveur avec `Ctrl+C`.

Le package racine est `com.fitnessfranchise.backend` : `health` contient
le contrôleur et sa réponse, `config` contient la configuration CORS.
Seule l'origine `http://localhost:5173` et la méthode GET sont autorisées
pour les requêtes CORS sous `/api/**`.

Le pilote PostgreSQL est présent pour la suite du sprint. Aucune connexion,
configuration de source de données ou couche de persistance n'est activée :
cette première API démarre sans PostgreSQL. Aucune autre base n'est utilisée.

Les tests chargent le contexte Spring complet et vérifient la réponse JSON
exacte, le préflight CORS autorisé et le refus d'une autre origine.
Les dossiers `target/` et `.tools/` sont ignorés par Git.
