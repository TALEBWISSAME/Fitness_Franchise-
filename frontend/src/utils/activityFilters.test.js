import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyActivityFilters, filterActivities, getParisActivityDay, validateActivityFilters } from './activityFilters.js'

// Fixtures de test uniquement ; jamais importées par l’application.
const activities = [
  { id: 3, date: '2026-10-29T23:59:59', equipmentType: 'TREADMILL' },
  { id: 2, date: '2026-10-28T12:00:00', equipmentType: 'TEST_TYPE' },
  { id: 1, date: '2026-10-27T00:00:00', equipmentType: 'TREADMILL' },
]
const ids = changes => filterActivities(activities, { ...emptyActivityFilters, ...changes }).map(activity => activity.id)

test('sans filtre : conserve toutes les activités et leur ordre', () => {
  assert.deepEqual(ids({}), [3, 2, 1])
})
test('date de début seule, inclusive', () => {
  assert.deepEqual(ids({ from: '2026-10-28' }), [3, 2])
})
test('date de fin seule, inclusive', () => {
  assert.deepEqual(ids({ to: '2026-10-28' }), [2, 1])
})
test('période complète et journée unique incluent leurs bornes', () => {
  assert.deepEqual(ids({ from: '2026-10-27', to: '2026-10-29' }), [3, 2, 1])
  assert.deepEqual(ids({ from: '2026-10-29', to: '2026-10-29' }), [3])
})
test('période inversée : erreur et aucun résultat trompeur', () => {
  const filters = { ...emptyActivityFilters, from: '2026-10-29', to: '2026-10-27' }
  assert.ok(validateActivityFilters(filters))
  assert.deepEqual(filterActivities(activities, filters), [])
})
test('équipement seul', () => {
  assert.deepEqual(ids({ equipmentType: 'TREADMILL' }), [3, 1])
})
test('période et équipement combinés', () => {
  assert.deepEqual(ids({ from: '2026-10-28', to: '2026-10-29', equipmentType: 'TREADMILL' }), [3])
})
test('réinitialiser les valeurs restaure la liste entière', () => {
  assert.deepEqual(ids({ ...emptyActivityFilters }), [3, 2, 1])
})
test('aucune correspondance et données vides', () => {
  assert.deepEqual(ids({ from: '2027-01-01' }), [])
  assert.deepEqual(filterActivities([], emptyActivityFilters), [])
})
test('dates invalides refusées et valeurs manquantes non converties', () => {
  assert.ok(validateActivityFilters({ from: '2026-02-30', to: '' }))
  assert.equal(getParisActivityDay('2026-02-30T12:00:00'), null)
  assert.equal(getParisActivityDay(null), null)
  assert.equal(getParisActivityDay('invalid'), null)
})
test('LocalDateTime reste un jour parisien quel que soit le fuseau du navigateur', () => {
  assert.equal(getParisActivityDay('2026-10-29T00:00:00'), '2026-10-29')
  assert.equal(getParisActivityDay('2026-10-29T23:59:59.123456'), '2026-10-29')
})
test('conversion des instants à Paris, été/hiver et changement de jour', () => {
  assert.equal(getParisActivityDay('2026-07-01T22:30:00Z'), '2026-07-02')
  assert.equal(getParisActivityDay('2026-12-01T22:30:00Z'), '2026-12-01')
  assert.equal(getParisActivityDay('2026-12-01T23:30:00Z'), '2026-12-02')
  assert.equal(getParisActivityDay('2026-10-25T00:30:00Z'), '2026-10-25')
  assert.equal(getParisActivityDay('2026-10-25T01:30:00Z'), '2026-10-25')
  assert.equal(getParisActivityDay('2026-10-29T00:30:00+03:00'), '2026-10-28')
})
