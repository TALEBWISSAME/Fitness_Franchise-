import { useReducer, useState } from 'react'
import { demoEquipment } from '../../dev/equipment.js'
import { demoReservationReducer, demoTomorrow } from '../../dev/reservations.js'
import DemoReservationForm from '../reservations/DemoReservationForm.dev.jsx'
import DemoReservations from '../reservations/DemoReservations.dev.jsx'

function DemoEquipmentContent({ renderCatalog }) {
  const [state, dispatch] = useReducer(demoReservationReducer, null, () => ({
    reservations: [], machine: null, cancelling: null, errors: {}, notice: '',
    blocked: [{ machineId: 'demo-treadmill-01', date: demoTomorrow(), slotId: '10:00' }],
  }))
  return (
    <>
      <p className="equipment-demo-notice">Disponibilités fictives. Aucune connexion à un compte ou à une salle réelle. Les réservations sont effacées en quittant l’aperçu.</p>
      <p className="equipment-booking-feedback" role="status">{state.notice}</p>
      {renderCatalog({ equipment: demoEquipment, loading: false, error: '', demonstration: true, onReserve: machine => dispatch({ type: 'open', machine }), reservationsContent: <DemoReservations reservations={state.reservations} cancelling={state.cancelling} dispatch={dispatch} /> })}
      {state.machine && <DemoReservationForm machine={state.machine} reservations={state.reservations} blocked={state.blocked} errors={state.errors} onClose={() => dispatch({ type: 'close' })} onSubmit={request => dispatch({ type: 'book', ...request })} />}
    </>
  )
}

export default function EquipmentPreview({ children, renderPage, renderCatalog }) {
  const [preview, setPreview] = useState(false)
  const controls = <div className="equipment-preview-actions">{preview && <span className="equipment-demo-badge" role="status">Données de démonstration</span>}<button className="button-secondary" type="button" aria-pressed={preview} onClick={() => setPreview(current => !current)}>{preview ? 'Quitter l’aperçu' : 'Prévisualiser les équipements'}</button></div>
  return renderPage(preview ? <DemoEquipmentContent renderCatalog={renderCatalog} /> : children, controls)
}
