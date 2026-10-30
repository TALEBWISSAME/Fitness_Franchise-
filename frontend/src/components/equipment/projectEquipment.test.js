import test from 'node:test'
import assert from 'node:assert/strict'
import { projectEquipment } from './projectEquipment.js'
import { equipmentUniverses, machineUniverse } from './equipmentUniverses.js'

test('20 reference models, five per official universe, with no invented inventory', () => {
  assert.equal(projectEquipment.length, 20)
  assert.equal(new Set(projectEquipment.map(machine => machine.name)).size, 20)
  for (const universe of equipmentUniverses) {
    assert.equal(projectEquipment.filter(machine => machineUniverse(machine) === universe.id).length, 5)
  }
  for (const machine of projectEquipment) {
    assert.equal(machine.referenceModel, true)
    assert.ok(machine.description)
    assert.equal(machine.status, undefined)
    assert.equal(machine.location, undefined)
    assert.equal(machine.id, undefined)
  }
})

test('generic strength inventory is never assigned an invented muscle group', () => {
  assert.equal(machineUniverse({ type: 'STRENGTH', name: 'Presse Performance' }), '')
  assert.equal(machineUniverse({ type: 'ROWING' }), 'cardio')
  assert.equal(machineUniverse({ type: 'STRENGTH', category: 'lower-body' }), 'lower-body')
})
