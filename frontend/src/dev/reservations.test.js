import test from 'node:test'
import assert from 'node:assert/strict'
import { demoReservationReducer, demoTomorrow, isDemoSlotUnavailable, validateDemoReservation } from './reservations.js'

const now = new Date('2026-10-29T12:00:00Z')
const machine = { id: 'demo-machine', name: 'Machine de test', status: 'available' }
const initial = () => ({ reservations: [], blocked: [], machine, errors: {}, notice: '', cancelling: null })
const validate = changes => validateDemoReservation({ machine, date: '2026-10-30', slotId: '11:00', reservations: [], blocked: [], now, ...changes })

test('date et créneau requis, dates impossibles et passées refusées', () => {
  assert.ok(validate({ date: '' }).date)
  assert.ok(validate({ date: '2026-02-30' }).date)
  assert.ok(validate({ date: '2026-10-28' }).date)
  assert.ok(validate({ slotId: '' }).slotId)
  assert.ok(validate({ slotId: '11:30' }).slotId)
})
test('créneaux déjà commencés refusés selon Europe/Paris', () => {
  assert.ok(validate({ date: '2026-10-29', slotId: '13:00' }).slotId)
  assert.deepEqual(validate({ date: '2026-10-29', slotId: '14:00' }), {})
})
test('machine occupée ou absente non réservable', () => {
  assert.ok(validate({ machine: { ...machine, status: 'busy' } }).form)
  assert.ok(validate({ machine: null }).form)
})
test('blocage fictif refusé, autre machine et autre date acceptées', () => {
  const blocked = [{ machineId: machine.id, date: '2026-10-30', slotId: '11:00' }]
  assert.ok(validate({ blocked }).slotId)
  assert.deepEqual(validate({ blocked, machine: { ...machine, id: 'other' } }), {})
  assert.deepEqual(validate({ blocked, date: '2026-10-31' }), {})
})
test('réservation valide confirmée uniquement en état local', () => {
  const state = demoReservationReducer(initial(), { type: 'book', date: '2026-10-30', slotId: '11:00', now })
  assert.equal(state.reservations.length, 1)
  assert.equal(state.reservations[0].status, 'confirmed')
  assert.equal(state.machine, null)
  assert.match(state.notice, /fictive/)
})
test('deux demandes successives ne peuvent réserver le même créneau', () => {
  const action = { type: 'book', date: '2026-10-30', slotId: '11:00', now }
  let state = demoReservationReducer(initial(), action)
  state = demoReservationReducer(state, { type: 'open', machine })
  state = demoReservationReducer(state, action)
  assert.equal(state.reservations.length, 1)
  assert.ok(state.errors.slotId)
})
test('fermer la confirmation annulation conserve la réservation', () => {
  let state = demoReservationReducer(initial(), { type: 'book', date: '2026-10-30', slotId: '11:00', now })
  state = demoReservationReducer(state, { type: 'askCancel', id: state.reservations[0].id })
  state = demoReservationReducer(state, { type: 'close' })
  assert.equal(state.reservations[0].status, 'confirmed')
})
test('annulation confirmée libère le créneau et permet une nouvelle réservation', () => {
  const action = { type: 'book', date: '2026-10-30', slotId: '11:00', now }
  let state = demoReservationReducer(initial(), action)
  state = demoReservationReducer(state, { type: 'askCancel', id: state.reservations[0].id })
  state = demoReservationReducer(state, { type: 'cancel' })
  assert.equal(state.reservations[0].status, 'cancelled')
  assert.equal(isDemoSlotUnavailable(machine.id, '2026-10-30', '11:00', state.reservations, []), false)
  state = demoReservationReducer(state, { type: 'open', machine })
  state = demoReservationReducer(state, action)
  assert.equal(state.reservations.filter(item => item.status === 'confirmed').length, 1)
})
test('demain suit le calendrier Paris au changement d’heure et d’année', () => {
  assert.equal(demoTomorrow(new Date('2026-10-24T22:30:00Z')), '2026-10-26')
  assert.equal(demoTomorrow(new Date('2026-12-31T12:00:00Z')), '2027-01-01')
})
