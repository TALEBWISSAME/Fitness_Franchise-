import { getParisActivityDay } from './activityFilters.js'

function shiftDay(day, offset) {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

export function getPreviewReferenceDay(activities) {
  const days = activities.map(activity => getParisActivityDay(activity.date)).filter(Boolean).sort()
  if (!days.length) throw new Error('Aucune date de référence disponible')
  return days.at(-1)
}

// Quatre semaines calendaires : lundi à dimanche, dont celle du jour de
// référence. Les calculs UTC portent sur des jours déjà convertis à Paris,
// pas sur des durées de 24 h (changement d’heure).
export function buildActivityStatistics(activities, referenceDay) {
  if (getParisActivityDay(referenceDay) !== referenceDay) throw new Error('Jour de référence invalide')
  const weekday = new Date(`${referenceDay}T00:00:00Z`).getUTCDay()
  const lastMonday = shiftDay(referenceDay, -((weekday + 6) % 7))
  const weeks = Array.from({ length: 4 }, (_, index) => {
    const startDate = shiftDay(lastMonday, (index - 3) * 7)
    return { startDate, endDate: shiftDay(startDate, 6), sessionCount: 0 }
  })
  const summary = { sessionCount: 0, durationMinutes: 0, distanceKm: 0 }
  for (const activity of activities) {
    const day = getParisActivityDay(activity.date)
    const week = day && weeks.find(item => day >= item.startDate && day <= item.endDate)
    if (!week) continue
    week.sessionCount += 1
    summary.sessionCount += 1
    summary.durationMinutes += activity.durationMinutes
    summary.distanceKm += activity.distanceKm
  }
  summary.distanceKm = Math.round(summary.distanceKm * 100) / 100
  return { summary, weeks }
}

export function formatStatisticsDay(day, includeYear = false) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: includeYear ? 'numeric' : undefined, timeZone: 'UTC',
  })
}
