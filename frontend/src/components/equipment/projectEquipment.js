// Official model list supplied by the project owner. Not installed inventory.
const groups = [
  ['cardio', [
    ['Tapis de course', 'TREADMILL', 'Un support pour la marche et la course en intérieur.'],
    ["Vélo d’appartement", 'BIKE', 'Un entraînement cardio en position assise, basé sur le pédalage.'],
    ['Vélo elliptique', 'ELLIPTICAL', 'Un mouvement continu associant les bras et les jambes.'],
    ['Rameur', 'ROWING', 'Un mouvement de rame associant une poussée des jambes et un tirage des bras.'],
    ['Escalier cardio', 'STAIR_CLIMBER', 'Un entraînement d’endurance fondé sur la montée de marches.'],
  ]],
  ['upper-body', [
    ['Développé poitrine', 'CHEST_PRESS', 'Un mouvement de poussée guidé pour le travail des pectoraux.'],
    ['Tirage vertical', 'LAT_PULLDOWN', 'Un tirage du haut vers le bas pour le travail du dos.'],
    ['Tirage horizontal', 'SEATED_ROW', 'Un tirage vers le buste pour le travail du dos.'],
    ['Développé épaules', 'SHOULDER_PRESS', 'Un mouvement de poussée vers le haut pour les épaules.'],
    ['Machine à biceps', 'BICEPS_CURL', 'Un mouvement de flexion des coudes pour le travail des biceps.'],
  ]],
  ['lower-body', [
    ['Presse à cuisses', 'LEG_PRESS', 'Un mouvement de poussée avec les jambes sur un plateau guidé.'],
    ['Leg extension', 'LEG_EXTENSION', 'Un mouvement d’extension des genoux pour le travail des quadriceps.'],
    ['Leg curl', 'LEG_CURL', 'Un mouvement de flexion des genoux pour les muscles arrière des cuisses.'],
    ['Machine abducteurs', 'HIP_ABDUCTOR', 'Un mouvement d’écartement des jambes en position assise.'],
    ['Machine à mollets', 'CALF_RAISE', 'Un mouvement de montée sur les pointes pour le travail des mollets.'],
  ]],
  ['functional', [
    ['Poulie vis-à-vis', 'CABLE_CROSSOVER', 'Deux poulies pour réaliser des mouvements de tirage et de poussée variés.'],
    ['Machine à abdominaux', 'AB_CRUNCH', 'Un mouvement guidé de flexion du buste pour les abdominaux.'],
    ['Machine à lombaires', 'BACK_EXTENSION', 'Un mouvement guidé d’extension du buste.'],
    ['Machine à dips assistés', 'ASSISTED_DIP', 'Un mouvement de dips avec un mécanisme d’assistance.'],
    ['Smith machine', 'SMITH_MACHINE', 'Une barre guidée pour différents mouvements de musculation.'],
  ]],
]

export const projectEquipment = groups.flatMap(([category, models]) => models.map(([name, type, description]) => ({ name, type, description, category, referenceModel: true })))
