import { useState } from 'react'
import gymBanner from '../assets/gym-banner.png'
import ApiTestModal from '../components/ApiTestModal.jsx'
import useActivities from '../hooks/useActivities.js'

function HomePage() {
  const [showApiModal, setShowApiModal] = useState(false)
  const { activities, loading, error } = useActivities()
  const latestActivity = activities[0]
  return (
    <>
      <section className="welcome-banner" aria-labelledby="welcome-title">
        <img className="banner-image" src={gymBanner} alt="" />
        <div className="banner-content">
          <h1 id="welcome-title">Bienvenue sur<br /><span>Fitness Franchise</span></h1>
          <p>Suivez vos activités sportives dans toutes nos salles de la franchise.</p>
        </div>
      </section>
      <div className="cards-grid">
        <section className="card system-card" aria-labelledby="system-title">
          <h2 id="system-title">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></svg>
            État du système
          </h2>
          <p className="status"><span className="status-dot" aria-hidden="true" />{loading ? 'Connexion en cours…' : error ? 'Connexion indisponible' : 'Backend connecté'}</p>
          <p className="card-description" id="api-help">Les activités sont actualisées automatiquement toutes les cinq secondes.</p>
          <button
  className="api-button"
  type="button"
  onClick={() => setShowApiModal(true)}
>
  Tester la connexion API
</button>
        </section>
        <section className="card" aria-labelledby="equipment-title">
          <h2 id="equipment-title">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9" /></svg>
            Équipement simulé
          </h2>
          <p className="equipment-name">Tapis de course</p>
          <p className="status"><span className="status-dot" aria-hidden="true" />Non vérifié</p>
        </section>
        <section className="card activity-card" aria-labelledby="activity-title">
          <h2 id="activity-title">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M5 20v-5m5 5V11m5 9V7m5 13V3" /></svg>
            Dernière activité sportive
          </h2>
          {error && <p role="alert">{error}</p>}
          {loading ? <p>Chargement des activités…</p> : latestActivity ? (
            <div>
              <p>{latestActivity.equipmentType === 'TREADMILL' ? 'Tapis de course' : latestActivity.equipmentType}</p>
              <p>{latestActivity.durationMinutes} min · {latestActivity.distanceKm} km</p>
              <p>{new Date(latestActivity.date).toLocaleString('fr-FR')}</p>
            </div>
          ) : (
            <div className="empty-state"><span className="empty-state-mark" aria-hidden="true">—</span><p>{error ? 'Activités indisponibles' : 'Aucune activité disponible'}</p></div>
          )}
        </section>
      </div>
      {showApiModal && (
  <ApiTestModal
    onClose={() => setShowApiModal(false)}
  />
)}
    </>
  )
}
export default HomePage
