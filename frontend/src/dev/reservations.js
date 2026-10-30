import { getParisActivityDay } from '../utils/activityFilters.js'

// Règles de démonstration exclusivement : créneaux d’une heure, Europe/Paris.
// Ni ces horaires ni ce modèle local ne constituent un contrat serveur.
export const demoSlots = Array.from({ length: 11 }, (_, index) => {
  const start = `${String(index + 9).padStart(2, '0')}:00`
  const end = `${String(index + 10).padStart(2, '0')}:00`
  return { id: start, start, end, label: `${start} – ${end}` }
})

export function demoTomorrow(now = new Date()) {
  const day = getParisActivityDay(now.toISOString())
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

export function isDemoSlotUnavailable(machineId, date, slotId, reservations, blocked) {
  return [...blocked, ...reservations.filter(item => item.status === 'confirmed')]
    .some(item => item.machineId === machineId && item.date === date && item.slotId === slotId)
}

export function validateDemoReservation({ machine, date, slotId, reservations, blocked, now = new Date() }) {
  const errors = {}
  const today = getParisActivityDay(now.toISOString())
  if (!date || getParisActivityDay(date) !== date) errors.date = 'Choisissez une date valide.'
  else if (date < today) errors.date = 'La date ne peut pas être dans le passé.'
  const slot = demoSlots.find(item => item.id === slotId)
  if (!slot) errors.slotId = 'Choisissez un créneau horaire.'
  else if (!errors.date) {
    const clock = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
    if (date === today && slot.start <= clock) errors.slotId = 'Ce créneau est déjà commencé ou terminé.'
    else if (isDemoSlotUnavailable(machine?.id, date, slotId, reservations, blocked)) errors.slotId = 'Ce créneau est indisponible. Choisissez un autre horaire.'
  }
  if (!machine || machine.status !== 'available') errors.form = 'Cette machine n’est pas réservable dans la démonstration.'
  return errors
}

export function demoReservationReducer(state, action) {
  if (action.type === 'open') return { ...state, machine: action.machine, errors: {}, notice: '' }
  if (action.type === 'close') return { ...state, machine: null, cancelling: null, errors: {} }
  if (action.type === 'book') {
    const errors = validateDemoReservation({ machine: state.machine, date: action.date, slotId: action.slotId, reservations: state.reservations, blocked: state.blocked, now: action.now })
    if (Object.keys(errors).length) return { ...state, errors }
    const reservation = { id: `demo-reservation-${state.reservations.length + 1}`, machineId: state.machine.id, machineName: state.machine.name, date: action.date, slotId: action.slotId, status: 'confirmed' }
    return { ...state, machine: null, errors: {}, reservations: [...state.reservations, reservation], notice: 'Réservation fictive ajoutée. Aucune réservation réelle effectuée.' }
  }
  if (action.type === 'askCancel') return { ...state, cancelling: action.id, notice: '' }
  if (action.type === 'cancel') return { ...state, cancelling: null, reservations: state.reservations.map(item => item.id === state.cancelling ? { ...item, status: 'cancelled' } : item), notice: 'Réservation fictive annulée. Aucun changement dans un système réel.' }
  return state
}
