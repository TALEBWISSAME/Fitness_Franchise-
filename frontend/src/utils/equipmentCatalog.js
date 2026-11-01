export const DISTANCE_ACTIVITY_EQUIPMENT_TYPES = new Set([
  'TREADMILL',
  'BIKE',
  'ELLIPTICAL',
  'ROWING',
])

const LEGACY_EQUIPMENT_OPTIONS = [
  { value: 'TREADMILL', label: 'Tapis de course' },
  { value: 'BIKE', label: 'Vélo' },
  { value: 'ELLIPTICAL', label: 'Elliptique' },
  { value: 'ROWING', label: 'Rameur' },
]

const CATEGORY_LABELS = {
  cardio: 'Cardio',
  'upper-body': 'Musculation haut du corps',
  'lower-body': 'Musculation bas du corps',
  functional: 'Renforcement et entraînement fonctionnel',
}

export function isEquipmentCatalog(value) {
  return Array.isArray(value) && value.every(equipment =>
    equipment
    && Number.isInteger(equipment.id)
    && equipment.id > 0
    && typeof equipment.name === 'string'
    && equipment.name.trim() !== ''
    && typeof equipment.type === 'string'
    && equipment.type.trim() !== ''
    && typeof equipment.category === 'string'
    && equipment.category.trim() !== '')
}

export function getEquipmentCategoryLabel(category) {
  return CATEGORY_LABELS[category]
    || category.replaceAll('-', ' ').replace(/\b\p{L}/gu, character => character.toLocaleUpperCase('fr'))
}

export function equipmentRequiresDistance(type) {
  return DISTANCE_ACTIVITY_EQUIPMENT_TYPES.has(type)
}

export function getEquipmentTypeOptions(catalog) {
  const options = new Map(LEGACY_EQUIPMENT_OPTIONS.map(option => [option.value, option]))
  for (const equipment of catalog) {
    if (!options.has(equipment.type) || !LEGACY_EQUIPMENT_OPTIONS.some(option => option.value === equipment.type)) {
      options.set(equipment.type, {
        value: equipment.type,
        label: `${equipment.name} · ${getEquipmentCategoryLabel(equipment.category)}`,
      })
    } else {
      options.set(equipment.type, { value: equipment.type, label: equipment.name })
    }
  }
  return [...options.values()]
}

export function groupEquipmentByCategory(equipment) {
  return equipment.reduce((groups, item) => {
    const group = groups.find(entry => entry.category === item.category)
    if (group) group.items.push(item)
    else groups.push({ category: item.category, label: getEquipmentCategoryLabel(item.category), items: [item] })
    return groups
  }, [])
}
