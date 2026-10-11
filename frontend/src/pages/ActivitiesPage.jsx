import { useState } from 'react'
import ActivityDetailsModal from '../components/ActivityDetailsModal.jsx'
import useActivities from '../hooks/useActivities.js'
const formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
function ActivitiesPage() {
  const [selectedActivity, setSelectedActivity] = useState(null)

  const { activities, loading, error } = useActivities()

  return (
    <section className="activities-page" aria-labelledby="activities-title">
      <div className="card">
        <h1 id="activities-title">
  <svg
    className="activities-title-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M5 20v-5m5 5V11m5 9V7m5 13V3" />
  </svg>
  <span>Activités sportives</span>
</h1>
        <p className="card-description">
          Dernières activités reçues depuis le simulateur
        </p>
      </div>

      <div className="card">
        {error && <p role="alert">{error}</p>}
        <table className="activities-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Équipement</th>
              <th scope="col">Durée</th>
              <th scope="col">Distance</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          
<tbody>
  {loading ? (
    <tr><td colSpan={5}>Chargement des activités…</td></tr>
  ) : activities.length === 0 ? (
    <tr>
      <td colSpan={5}>{error ? 'Activités indisponibles' : 'Aucune activité disponible'}</td>
    </tr>
  ) : (
    activities.map((activity) => (
      <tr key={activity.id}>
        <td>{formatDate(activity.date)}</td>
        <td>
          {activity.equipmentType === 'TREADMILL'
            ? 'Tapis de course'
            : activity.equipmentType}
        </td>
        <td>{activity.durationMinutes} min</td>
        <td>{activity.distanceKm} km</td>
        <td>
          <button
            type="button"
            className="view-activity-button"
            onClick={() => setSelectedActivity(activity)}
          >
            Voir
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>
      <ActivityDetailsModal
  activity={selectedActivity}
  onClose={() => setSelectedActivity(null)}
/>
    </section>
  )
}

export default ActivitiesPage
