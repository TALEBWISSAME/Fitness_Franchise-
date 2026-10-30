import test from 'node:test'
import assert from 'node:assert/strict'
import { buildActivityStatistics, getPreviewReferenceDay } from './activityStatistics.js'
import { previewActivities } from '../dev/activities.js'

const activity = date => ({ date, durationMinutes: 10, distanceKm: 0.1 })

test('fixtures partagées : totaux calculés et quatre semaines chronologiques', () => {
  const reference = getPreviewReferenceDay(previewActivities)
  assert.equal(reference, '2026-10-29')
  const { summary, weeks } = buildActivityStatistics(previewActivities, reference)
  assert.deepEqual(summary, { sessionCount: 6, durationMinutes: 180, distanceKm: 23.5 })
  assert.deepEqual(weeks.map(week => week.startDate), ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26'])
  assert.deepEqual(weeks.map(week => week.sessionCount), [1, 2, 1, 2])
  assert.equal(weeks.at(-1).endDate, '2026-11-01')
  assert.equal(weeks.reduce((total, week) => total + week.sessionCount, 0), summary.sessionCount)
})

test('semaines vides conservées à zéro', () => {
  const { weeks } = buildActivityStatistics([activity('2026-10-12T12:00:00')], '2026-10-29')
  assert.deepEqual(weeks.map(week => week.sessionCount), [0, 1, 0, 0])
})

test('aucune activité : trois totaux nuls et quatre semaines', () => {
  const { summary, weeks } = buildActivityStatistics([], '2026-10-29')
  assert.deepEqual(summary, { sessionCount: 0, durationMinutes: 0, distanceKm: 0 })
  assert.equal(weeks.length, 4)
  assert.deepEqual(weeks.map(week => week.sessionCount), [0, 0, 0, 0])
})

test('bornes lundi/dimanche inclusives, activités hors fenêtre exclues des trois totaux', () => {
  const dates = ['2026-10-04T23:59:59', '2026-10-05T00:00:00', '2026-11-01T23:59:59', '2026-11-02T00:00:00']
  const { summary, weeks } = buildActivityStatistics(dates.map(activity), '2026-10-29')
  assert.deepEqual(summary, { sessionCount: 2, durationMinutes: 20, distanceKm: 0.2 })
  assert.deepEqual(weeks.map(week => week.sessionCount), [1, 0, 0, 1])
})

test('conversion Paris avant classement et passage à l’heure d’hiver', () => {
  const { weeks } = buildActivityStatistics([
    activity('2026-10-25T22:59:59Z'),
    activity('2026-10-25T23:00:00Z'),
  ], '2026-10-29')
  assert.deepEqual(weeks.map(week => week.sessionCount), [0, 0, 1, 1])
})

test('changement d’année et référence le dimanche', () => {
  const { weeks } = buildActivityStatistics([], '2027-01-03')
  assert.deepEqual(weeks.map(week => week.startDate), ['2026-12-07', '2026-12-14', '2026-12-21', '2026-12-28'])
  assert.equal(weeks.at(-1).endDate, '2027-01-03')
})

test('jour de référence invalide refusé et dates d’activité invalides ignorées', () => {
  assert.throws(() => buildActivityStatistics([], '2026-02-30'))
  assert.equal(buildActivityStatistics([activity('invalid')], '2026-10-29').summary.sessionCount, 0)
})
