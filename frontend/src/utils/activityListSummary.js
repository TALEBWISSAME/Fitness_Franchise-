// Résumé de présentation uniquement : pas de modification des statistiques M04.
// Une valeur absente/invalide rend le total concerné indisponible, pas égal à zéro.
function total(activities, field) {
  let sum = 0
  for (const activity of activities) {
    const value = activity[field]
    if (value == null || (typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) return null
    const number = Number(value)
    if (!Number.isFinite(number) || number < 0) return null
    sum += number
  }
  return Number.isFinite(sum) ? sum : null
}

export function summarizeActivityList(activities) {
  return {
    count: activities.length,
    durationMinutes: total(activities, 'durationMinutes'),
    distanceKm: total(activities, 'distanceKm'),
  }
}
