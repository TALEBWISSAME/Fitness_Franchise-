# Simulateur de tapis de course

Le simulateur Python reproduit une séance sur tapis, se connecte au backend
Spring Boot avec un compte membre, récupère le catalogue d'équipements, puis
envoie la séance avec l'identifiant du tapis choisi.

## Prérequis

- Python 3 installé.
- Backend Fitness Franchise démarré et connecté à PostgreSQL.
- Compte de test membre existant.
- Au moins un équipement dont `type` vaut exactement `TREADMILL` dans le
  catalogue.

## Lancer depuis le terminal intégré de VS Code

1. Démarrez le backend dans un premier terminal VS Code et attendez son
   démarrage complet.
2. Ouvrez un second terminal PowerShell dans VS Code, puis exécutez :

   ```powershell
   Set-Location 'C:\Users\taleb\Desktop\Fitness_Franchise-\simulator'
   python --version
   python .\treadmill_simulator.py
   ```

3. Saisissez l'adresse e-mail du compte de test lorsqu'elle est demandée.
   Saisissez ensuite son mot de passe à l'invite masquée. Ne placez pas le mot
   de passe dans une commande ou une variable d'environnement.
4. Le simulateur s'authentifie, vérifie la session, puis charge
   `GET /api/equipments`. Il recherche le type exact `TREADMILL`. Si la requête
   échoue, si la réponse est invalide ou si le tapis est absent, le programme
   s'arrête avant la simulation et avant tout POST.
5. Si un tapis est trouvé, le programme simule 15 à 45 minutes d'entraînement,
   avec une vitesse aléatoire entre 5 et 12 km/h. Une seconde réelle représente
   cinq minutes simulées. Il envoie ensuite la durée, la distance, la date,
   `equipmentId` et le type historique `TREADMILL` à `POST /api/activities`.

> **Attention :** une exécution réussie crée une séance réelle et persistante
> pour le compte connecté dans PostgreSQL. N'exécutez le simulateur que lorsque
> vous souhaitez réellement ajouter cette séance.

Le simulateur utilise par défaut `http://localhost:8080`. Pour un autre serveur,
`FITNESS_API_URL` doit être l'origine seule (par exemple `http://localhost:8080`),
sans suffixe `/api`.

Les logs n'affichent ni mot de passe, ni e-mail, ni identifiant de session,
ni cookie, ni identifiant numérique de l'équipement.

## Vérification en lecture seule dans pgAdmin 4

Après une exécution réussie, ouvrez le Query Tool de la base `fitness_franchise`
et vérifiez les séances récentes avec cette requête en lecture seule :

```sql
SELECT
    a.id,
    a.date,
    a.duration_minutes,
    a.distance_km,
    a.equipment_id,
    a.equipment_type,
    e.name AS equipment_name,
    a.adherent_id
FROM public.activities AS a
LEFT JOIN public.equipments AS e ON e.id = a.equipment_id
ORDER BY a.id DESC
LIMIT 10;
```

La nouvelle ligne doit référencer le tapis via `equipment_id`, garder
`equipment_type = 'TREADMILL'` et contenir une durée et une distance numériques.
La requête ne modifie aucune donnée.

## Tests Python sans backend ni PostgreSQL

Depuis la racine du dépôt, lancez les tests qui utilisent des réponses HTTP
simulées :

```powershell
python -m unittest discover -s simulator -p "test_*.py" -v
```

Ces tests ne font aucune requête réseau et n'enregistrent aucune séance.
