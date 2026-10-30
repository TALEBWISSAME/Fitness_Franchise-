import { useRef } from 'react'
import useDialogFocus from '../hooks/useDialogFocus.js'
import { formatActivityDate } from '../utils/activityFilters.js'
import './ActivityDetailsModal.css'

function DetailIcon({ path }) {
  return <span className="detail-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg></span>
}

function ActivityDetailsModal({ activity, onClose, demonstration = false }) {
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, onClose, Boolean(activity))
  if (!activity) return null

  const duration = Number(activity.durationMinutes)
  const distance = Number(activity.distanceKm)
  const averageSpeed =
    duration > 0 && Number.isFinite(distance)
      ? ((distance * 60) / duration).toFixed(1)
      : null
  const formattedDate = formatActivityDate(activity.date)
  const equipmentName = activity.equipmentType === 'TREADMILL'
    ? 'Tapis de course'
    : activity.equipmentType || 'Équipement inconnu'

  return (
    <div className="modal-overlay activity-session-overlay">
      <section ref={dialogRef} tabIndex={-1} className="activity-modal activity-session-dialog" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title" aria-describedby="session-data-scope">
        <header className="modal-header session-heading">
          <span className="modal-equipment-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9" /></svg>
          </span>
          <div className="session-heading-text">
            <p className="session-eyebrow">Détails de la séance</p>
            <h2 id="activity-modal-title">{equipmentName}</h2>
            <time dateTime={activity.date}>{formattedDate} · Europe/Paris</time>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer la fenêtre">×</button>
        </header>

        <p id="session-data-scope" className={`session-data-scope${demonstration ? ' session-demo' : ''}`}>
          {demonstration ? 'Démonstration · aperçu fictif — aucune donnée réelle' : 'Vue globale · séance non associée à un compte'}
        </p>

        <dl className="session-main-metrics">
          <div>
            <dt><DetailIcon path="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" />Durée</dt>
            <dd>{activity.durationMinutes} <span>min</span></dd>
          </div>
          <div>
            <dt><DetailIcon path="M4 19 19 4l2 2L6 21Zm5-5 2 2m2-6 2 2m2-6 2 2" />Distance</dt>
            <dd>{activity.distanceKm} <span>km</span></dd>
          </div>
        </dl>

        {averageSpeed !== null && <dl className="session-secondary">
          <div><dt><DetailIcon path="M4 18a9 9 0 1 1 16 0M12 15l5-6M7 12h.01M12 7h.01" />Vitesse moyenne</dt><dd>{averageSpeed} <span>km/h</span></dd></div>
        </dl>}

        <footer className="modal-footer"><button type="button" className="modal-close-button" onClick={onClose}>Fermer</button></footer>
      </section>
    </div>
  )
}

export default ActivityDetailsModal
