import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getEquipmentCategoryLabel,
  groupEquipmentByCategory,
  isEquipmentCatalog,
  equipmentRequiresDistance,
  getEquipmentTypeOptions,
  DISTANCE_ACTIVITY_EQUIPMENT_TYPES,
} from './equipmentCatalog.js'

const equipment = [
  { id: 8, name: 'Presse à cuisses', type: 'LEG_PRESS', category: 'lower-body' },
  { id: 2, name: 'Vélo', type: 'BIKE', category: 'cardio' },
  { id: 3, name: 'Tapis', type: 'TREADMILL', category: 'cardio' },
]

test('accepts a catalog with the API response shape and rejects malformed rows', () => {
  assert.equal(isEquipmentCatalog(equipment), true)
  assert.equal(isEquipmentCatalog([]), true)
  assert.equal(isEquipmentCatalog([{ ...equipment[0], id: 0 }]), false)
  assert.equal(isEquipmentCatalog([{ ...equipment[0], category: '' }]), false)
  assert.equal(isEquipmentCatalog(null), false)
})

test('groups equipment by the API category without losing catalog order', () => {
  assert.deepEqual(groupEquipmentByCategory(equipment), [
    { category: 'lower-body', label: 'Musculation bas du corps', items: [equipment[0]] },
    { category: 'cardio', label: 'Cardio', items: [equipment[1], equipment[2]] },
  ])
  assert.equal(getEquipmentCategoryLabel('other-category'), 'Other Category')
})

test('requires distance only for treadmill, bike, elliptical and rowing', () => {
  assert.deepEqual([...DISTANCE_ACTIVITY_EQUIPMENT_TYPES], ['TREADMILL', 'BIKE', 'ELLIPTICAL', 'ROWING'])
  assert.equal(equipmentRequiresDistance('ROWING'), true)
  assert.equal(equipmentRequiresDistance('LEG_PRESS'), false)
})

test('builds unique filter options for catalog types and retains legacy types', () => {
  assert.deepEqual(getEquipmentTypeOptions(equipment), [
    { value: 'TREADMILL', label: 'Tapis' },
    { value: 'BIKE', label: 'Vélo' },
    { value: 'ELLIPTICAL', label: 'Elliptique' },
    { value: 'ROWING', label: 'Rameur' },
    { value: 'LEG_PRESS', label: 'Presse à cuisses · Musculation bas du corps' },
  ])
})
