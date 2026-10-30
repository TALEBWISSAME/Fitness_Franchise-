# Ajout des équipements de test — Sprint 2

## Tâche réalisée

Trois équipements ont été ajoutés à la table `public.equipments` de la base locale `fitness_franchise` : un tapis de course, un vélo et un vélo elliptique. Ils sont classés dans la catégorie `Cardio`.

## Requête SQL utilisée

```sql
INSERT INTO public.equipments (name, type, category)
VALUES
    ('Tapis 1', 'Treadmill', 'Cardio'),
    ('Velo 1', 'Bicycle', 'Cardio'),
    ('Velo elliptique 1', 'Elliptical', 'Cardio');
```

## Pour les membres de l'équipe

L'exécution de cette requête ajoute les trois lignes à la base PostgreSQL sur laquelle le Query Tool est connecté. Chaque membre peut l'exécuter une fois dans sa propre base `fitness_franchise`. Ne pas la relancer dans une base qui contient déjà ces équipements, car cette requête ne vérifie pas les doublons.
