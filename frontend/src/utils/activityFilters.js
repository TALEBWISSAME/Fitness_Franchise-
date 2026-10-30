const parisDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
})

export const emptyActivityFilters = { from: '', to: '', equipmentType: '' }

function isCalendarDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// Le backend actuel renvoie LocalDateTime sans fuseau : ces heures sont
// interprétées comme locales à Paris, selon la convention du Sprint 2.
// Une date avec Z/décalage représente un instant et est convertie à Paris.
export function getParisActivityDay(value) {
  if (typeof value !== 'string') return null
  if (isCalendarDay(value)) return value
  if (!isCalendarDay(value.slice(0, 10))) return null
  if (!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)) return null
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  const parts = Object.fromEntries(parisDate.formatToParts(date).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

// Même convention que le filtrage : les LocalDateTime sont des heures
// calendaires parisiennes ; seuls les instants avec décalage sont convertis.
export function formatActivityDate(value) {
  if (!getParisActivityDay(value)) return 'Non disponible'
  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  const calendarValue = value.length === 10 ? `${value}T00:00:00` : value
  return new Date(hasOffset ? value : `${calendarValue}Z`).toLocaleString('fr-FR', {
    timeZone: hasOffset ? 'Europe/Paris' : 'UTC',
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function validateActivityFilters({ from, to }) {
  if ((from && !isCalendarDay(from)) || (to && !isCalendarDay(to))) {
    return 'Saisissez des dates valides.'
  }
  return from && to && from > to
    ? 'La date de début doit être antérieure ou égale à la date de fin.'
    : ''
}

// Adaptateur local temporaire : aucun paramètre envoyé au backend.
// Les noms correspondent au futur contrat serveur from/to/equipmentType.
export function filterActivities(activities, filters) {
  if (validateActivityFilters(filters)) return []
  const { from, to, equipmentType } = filters
  return activities.filter(activity => {
    if (equipmentType && activity.equipmentType !== equipmentType) return false
    if (!from && !to) return true
    const day = getParisActivityDay(activity.date)
    return day !== null && (!from || day >= from) && (!to || day <= to)
  })
}
