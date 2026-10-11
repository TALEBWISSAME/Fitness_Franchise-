
function ActivityDetailsModal({ activity, onClose }) {
  if (!activity) return null

  const duration = Number(activity.durationMinutes)
  const distance = Number(activity.distanceKm)

  const averageSpeed =
    duration > 0 && Number.isFinite(distance)
      ? ((distance * 60) / duration).toFixed(1)
      : null

  const formattedDate = activity.date
    ? new Date(activity.date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Non disponible'

  const equipmentName =
    activity.equipmentType === 'TREADMILL'
      ? 'Tapis de course'
      : activity.equipmentType || 'Équipement inconnu'

  return (
    <div className="modal-overlay">
      <section
        className="activity-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-modal-title"
      >
        <div className="modal-header">
          <h2 id="activity-modal-title">
            Détails de l'activité
          </h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            ×
          </button>
        </div>

        <div className="modal-equipment">
          <div className="modal-equipment-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9" />
            </svg>
          </div>

          <div>
            <h3>{equipmentName}</h3>
            <p>Séance enregistrée depuis le simulateur</p>
          </div>
        </div>

        <div className="activity-details-grid">
          <div className="detail-card">
            <span className="detail-icon" aria-hidden="true">◷</span>
            <div>
              <span className="detail-label">Durée</span>
              <strong>{activity.durationMinutes} min</strong>
            </div>
          </div>

          <div className="detail-card">
            <span className="detail-icon" aria-hidden="true">⌖</span>
            <div>
              <span className="detail-label">Distance</span>
              <strong>{activity.distanceKm} km</strong>
            </div>
          </div>

          <div className="detail-card">
            <span className="detail-icon" aria-hidden="true">◴</span>
            <div>
              <span className="detail-label">Vitesse moyenne</span>
              <strong>
                {averageSpeed !== null
                  ? `${averageSpeed} km/h`
                  : 'Non disponible'}
              </strong>
            </div>
          </div>

          <div className="detail-card">
            <span className="detail-icon" aria-hidden="true">▦</span>
            <div>
              <span className="detail-label">Date et heure</span>
              <strong>{formattedDate}</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </section>
    </div>
  )
}

export default ActivityDetailsModal
