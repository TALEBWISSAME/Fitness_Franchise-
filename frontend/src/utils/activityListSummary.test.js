import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeActivityList } from './activityListSummary.js'
import { filterActivities } from './activityFilters.js'

test('résumé calculé uniquement sur les séances filtrées, sans mutation', () => {
  const activities = [
    { date: '2026-10-05', durationMinutes: 30, distanceKm: 4.5 },
    { date: '2026-10-12', durationMinutes: '20', distanceKm: '2.5' },
  ]
  assert.deepEqual(summarizeActivityList(activities), { count: 2, durationMinutes: 50, distanceKm: 7 })
  assert.deepEqual(summarizeActivityList(filterActivities(activities, { from: '2026-10-12', to: '', equipmentType: '' })), { count: 1, durationMinutes: 20, distanceKm: 2.5 })
  assert.equal(activities[1].durationMinutes, '20')
})

test('liste vide : trois valeurs à zéro, pas de séance inventée', () => {
  assert.deepEqual(summarizeActivityList([]), { count: 0, durationMinutes: 0, distanceKm: 0 })
})

test('total incomplet ou invalide signalé indépendamment pour chaque unité', () => {
  for (const invalid of [null, undefined, '', ' ', 'invalide', -1, Infinity, true]) {
    assert.deepEqual(summarizeActivityList([{ durationMinutes: invalid, distanceKm: 2 }]), { count: 1, durationMinutes: null, distanceKm: 2 })
    if (invalid !== null) {
      assert.deepEqual(summarizeActivityList([{ durationMinutes: 0, distanceKm: invalid }]), { count: 1, durationMinutes: 0, distanceKm: null })
    }
  }
})

test('distances non applicables sont exclues du total sans devenir zéro kilomètre', () => {
  assert.deepEqual(summarizeActivityList([
    { durationMinutes: 30, distanceKm: null },
    { durationMinutes: 20, distanceKm: 4.5 },
  ]), { count: 2, durationMinutes: 50, distanceKm: 4.5 })
  assert.deepEqual(summarizeActivityList([
    { durationMinutes: 30, distanceKm: null },
  ]), { count: 1, durationMinutes: 30, distanceKm: null })
})
