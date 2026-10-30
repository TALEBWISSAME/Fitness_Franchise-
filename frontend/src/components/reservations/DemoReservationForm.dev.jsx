import { useEffect, useRef, useState } from 'react'
import EquipmentDialog from '../equipment/EquipmentDialog.jsx'
import { demoSlots, demoTomorrow, isDemoSlotUnavailable } from '../../dev/reservations.js'

export default function DemoReservationForm({ machine, reservations, blocked, errors, onSubmit, onClose }) {
  const [date, setDate] = useState(demoTomorrow)
  const [slotId, setSlotId] = useState('')
  const formRef = useRef(null)
  useEffect(() => {
    const field = errors.date ? 'date' : errors.slotId ? 'slotId' : null
    if (field) formRef.current?.elements.namedItem(field)?.focus()
  }, [errors])

  return (
    <EquipmentDialog title="Réserver une machine" onClose={onClose}>
      <p className="equipment-booking-machine">{machine.name}</p>
      <p className="equipment-demo-notice">Réservation fictive — aucune réservation réelle effectuée</p>
      <form ref={formRef} noValidate onSubmit={event => { event.preventDefault(); onSubmit({ date, slotId, now: new Date() }) }}>
        <div className="auth-field"><label htmlFor="demo-booking-date">Date (obligatoire)</label><input id="demo-booking-date" name="date" type="date" required value={date} onChange={event => { setDate(event.target.value); setSlotId('') }} aria-invalid={errors.date ? true : undefined} aria-describedby={errors.date ? 'demo-booking-date-error' : undefined} />{errors.date && <p className="auth-error" id="demo-booking-date-error" role="alert">{errors.date}</p>}</div>
        <div className="auth-field"><label htmlFor="demo-booking-slot">Créneau horaire (obligatoire)</label><select id="demo-booking-slot" name="slotId" required value={slotId} onChange={event => setSlotId(event.target.value)} aria-invalid={errors.slotId ? true : undefined} aria-describedby={errors.slotId ? 'demo-booking-slot-error' : 'demo-booking-rules'}><option value="">Choisir un horaire</option>{demoSlots.map(slot => {
          const unavailable = isDemoSlotUnavailable(machine.id, date, slot.id, reservations, blocked)
          return <option key={slot.id} value={slot.id} disabled={unavailable}>{slot.label}{unavailable ? ' · Indisponible (démo)' : ''}</option>
        })}</select>{errors.slotId && <p className="auth-error" id="demo-booking-slot-error" role="alert">{errors.slotId}</p>}</div>
        <p className="equipment-small-note" id="demo-booking-rules">Créneaux d’une heure · Europe/Paris. Horaires et règles proposés uniquement pour cette démonstration.</p>
        {errors.form && <p className="auth-error" role="alert">{errors.form}</p>}
        <div className="equipment-dialog-actions"><button className="button-outline" type="button" onClick={onClose}>Fermer</button><button className="button-primary" type="submit">Confirmer la réservation fictive</button></div>
      </form>
    </EquipmentDialog>
  )
}
