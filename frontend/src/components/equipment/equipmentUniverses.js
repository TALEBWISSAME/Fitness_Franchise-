// Editorial universes, separate from machine inventory and availability.
export const equipmentUniverses = [
  { id: 'cardio', name: 'Cardio', icon: 'TREADMILL', image: '/images/fitness-premium/cardio.png', description: 'Travaillez votre endurance et trouvez votre rythme.' },
  { id: 'upper-body', name: 'Musculation haut du corps', icon: 'STRENGTH', image: '/images/fitness-premium/upper-body.png', description: 'Développez la force du dos, des épaules, des bras et des pectoraux.' },
  { id: 'lower-body', name: 'Musculation bas du corps', icon: 'STRENGTH', image: '/images/fitness-premium/lower-body.png', description: 'Renforcez vos jambes et construisez des appuis solides.' },
  { id: 'functional', name: 'Renforcement et entraînement fonctionnel', icon: 'FUNCTIONAL', image: '/images/fitness-premium/functional.png', description: 'Associez force, mobilité et coordination dans vos mouvements.' },
]

// Never infer a muscle group from a generic STRENGTH type or a machine name.
export function machineUniverse(machine) {
  const category = equipmentUniverses.find(item => item.id === machine.category || item.name === machine.category)
  if (category) return category.id
  if (['TREADMILL', 'BIKE', 'ELLIPTICAL', 'ROWING'].includes(machine.type)) return 'cardio'
  return ''
}
