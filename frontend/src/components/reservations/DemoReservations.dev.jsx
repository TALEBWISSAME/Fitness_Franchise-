import EquipmentDialog from '../equipment/EquipmentDialog.jsx'
import { demoSlots } from '../../dev/reservations.js'
import { formatStatisticsDay } from '../../utils/activityStatistics.js'

export default function DemoReservations({ reservations, cancelling, dispatch }) {
  const selected = reservations.find(item => item.id === cancelling)
  return (
    <section className="equipment-reservations" aria-labelledby="equipment-reservations-title" id="equipment-demo-reservations" tabIndex={-1}>
      <div className="equipment-results-heading"><h2 id="equipment-reservations-title">Mes réservations <span>· démonstration</span></h2><span>{reservations.filter(item => item.status === 'confirmed').length} active(s)</span></div>
      <p className="equipment-demo-notice">Réservation fictive — aucune réservation réelle effectuée</p>
      {reservations.length === 0 ? <div className="equipment-state equipment-reservations-empty"><span className="equipment-state-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 10h16m-12 5h8m-8 3h4" /></svg></span><div><h3>Votre prochain créneau commence ici</h3><p>Aucune réservation fictive pour le moment. Choisissez une machine disponible pour essayer.</p></div></div> : <ul className="equipment-reservation-list">{reservations.map(item => <li key={item.id}>
        <span className="equipment-reservation-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 10h16m4 5 2 2 4-4" /></svg></span>
        <div><h3>{item.machineName}</h3><p>{formatStatisticsDay(item.date, true)} · {demoSlots.find(slot => slot.id === item.slotId)?.label} · Europe/Paris</p></div>
        <span className="equipment-status" data-status={item.status}>{item.status === 'confirmed' ? 'Confirmée · démo' : 'Annulée · démo'}</span>
        {item.status === 'confirmed' && <button className="button-outline" type="button" onClick={() => dispatch({ type: 'askCancel', id: item.id })} aria-label={`Annuler la réservation fictive : ${item.machineName}`}>Annuler</button>}
      </li>)}</ul>}
      {selected && <EquipmentDialog title="Annuler cette réservation fictive ?" onClose={() => dispatch({ type: 'close' })}>
        <p>{selected.machineName} · {formatStatisticsDay(selected.date, true)} · {demoSlots.find(slot => slot.id === selected.slotId)?.label}</p>
        <p className="equipment-demo-notice">Cette action concerne uniquement la démonstration.</p>
        <div className="equipment-dialog-actions"><button className="button-outline" type="button" onClick={() => dispatch({ type: 'close' })}>Conserver</button><button className="button-primary" type="button" onClick={() => { dispatch({ type: 'cancel' }); requestAnimationFrame(() => document.getElementById('equipment-demo-reservations')?.focus()) }}>Confirmer l’annulation fictive</button></div>
      </EquipmentDialog>}
    </section>
  )
}
