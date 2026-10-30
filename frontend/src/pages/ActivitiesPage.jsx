import { lazy, Suspense, useState } from 'react'
import ActivityDetailsModal from '../components/ActivityDetailsModal.jsx'
import useActivities from '../hooks/useActivities.js'
import { emptyActivityFilters, filterActivities, formatActivityDate, validateActivityFilters } from '../utils/activityFilters.js'
import { summarizeActivityList } from '../utils/activityListSummary.js'
import './ActivitiesPage.css'

const ActivitiesPreview = import.meta.env.DEV
  ? lazy(() => import('../components/ActivitiesPreview.dev.jsx'))
  : null
function ActivitiesLayout({ children, actions }) {
  return (
    <section className="activities-dashboard" aria-labelledby="activities-title">
      <header className="activities-heading">
        <div>
          <h1 id="activities-title">Mes activités</h1>
          <p>Journal de vos séances personnelles</p>
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

function ActivitiesState({ children }) {
  return <div className="activities-state" role="status"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 2v4m6-4v4M9 11h6m-6 4h4" /></svg></span><p>{children}</p></div>
}

const listNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

function ActivitiesView({ activities, loading, error, demonstration = false }) {
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [filters, setFilters] = useState(emptyActivityFilters)

  const filterError = validateActivityFilters(filters)
  const filteredActivities = filterActivities(activities, filters)
  const summary = summarizeActivityList(filteredActivities)
  // Seul type actuellement pris en charge par le simulateur du projet.
  const equipmentTypes = ['TREADMILL', 'BIKE', 'ELLIPTICAL']

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters(previous => ({ ...previous, [name]: value }))
  }

  return (
    <div className="activities-content">
      <section className="activities-filter-bar" aria-labelledby="filters-title">
        <h2 className="activities-sr-only" id="filters-title">Filtrer les activités</h2>
        <form
          className="activity-filters-form"
          onSubmit={event => event.preventDefault()}
          onReset={() => setFilters({ ...emptyActivityFilters })}
          aria-describedby="filters-help"
        >
          <div className="auth-field">
            <label htmlFor="activities-from">Date de début <span>(facultatif)</span></label>
            <input id="activities-from" name="from" type="date" value={filters.from} onChange={updateFilter}
              aria-invalid={filterError ? true : undefined} aria-describedby={filterError ? 'filters-error' : undefined} />
          </div>
          <div className="auth-field">
            <label htmlFor="activities-to">Date de fin <span>(facultatif)</span></label>
            <input id="activities-to" name="to" type="date" value={filters.to} onChange={updateFilter}
              aria-invalid={filterError ? true : undefined} aria-describedby={filterError ? 'filters-error' : undefined} />
          </div>
          <div className="auth-field">
            <label htmlFor="activities-equipment">Type d’équipement</label>
            <select id="activities-equipment" name="equipmentType" value={filters.equipmentType} onChange={updateFilter}>
              <option value="">Tous les équipements</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>{type === 'TREADMILL' ? 'Tapis de course' : type}</option>
              ))}
            </select>
          </div>
          <button className="button-outline activities-reset" type="reset" aria-label="Réinitialiser les filtres">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></svg>
            Réinitialiser
          </button>
        </form>
        <p className="activities-filter-hint" id="filters-help">Dates inclusives · Europe/Paris · filtres sur les séances chargées</p>
        {filterError && <p className="auth-error" id="filters-error" role="alert">{filterError}</p>}
      </section>

      {!loading && !filterError && !(error && activities.length === 0) && <section className="activities-summary" aria-labelledby="activities-summary-title">
        <div className="activities-summary-heading"><h2 id="activities-summary-title">Résumé de la liste affichée</h2><p>{demonstration ? 'Séances fictives uniquement' : 'Vos séances personnelles'}</p></div>
        <dl>
          <div><dt><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 20v-5m5 5V11m5 9V7m5 13V3" /></svg>Séances affichées</dt><dd>{listNumber.format(summary.count)}</dd></div>
          <div><dt><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>Durée cumulée</dt><dd>{summary.durationMinutes === null ? <span>Non disponible</span> : <>{listNumber.format(summary.durationMinutes)} <span>min</span></>}</dd></div>
          <div><dt><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 19 15-15 2 2L6 21Zm5-5 2 2m2-6 2 2m2-6 2 2" /></svg>Distance cumulée</dt><dd>{summary.distanceKm === null ? <span>Non disponible</span> : <>{listNumber.format(summary.distanceKm)} <span>km</span></>}</dd></div>
        </dl>
      </section>}

      <div className="activities-list">
        <div className="activities-list-heading">
          <h2>Journal des séances</h2>
          <p aria-live="polite">{loading ? 'Chargement…' : filterError ? 'Période à corriger' : error && activities.length === 0 ? 'Indisponible' : `${filteredActivities.length} séance${filteredActivities.length === 1 ? '' : 's'}`}</p>
        </div>
        {error && (
          <div className="activities-service-error">
            <p role="alert">{activities.length ? 'Actualisation indisponible. Les dernières séances reçues restent affichées.' : 'Le service d’activités est momentanément indisponible.'}</p>
            <details><summary>Détails de connexion</summary><p>{error}</p></details>
          </div>
        )}
        <table className="activities-table" role="table" aria-label={demonstration ? 'Liste des séances fictives' : 'Liste de vos activités personnelles'}>
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col">Date</th>
              <th scope="col">Équipement</th>
              <th scope="col">Durée</th>
              <th scope="col">Distance</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          
<tbody role="rowgroup">
  {loading ? (
    <tr role="row"><td colSpan={5}><ActivitiesState>Chargement des activités…</ActivitiesState></td></tr>
  ) : filterError ? (
    <tr role="row"><td colSpan={5}><ActivitiesState>Corrigez la période pour afficher les activités.</ActivitiesState></td></tr>
  ) : activities.length === 0 ? (
    <tr role="row">
      <td colSpan={5}><ActivitiesState>{error ? 'Les séances s’afficheront ici lorsque le service sera rétabli.' : 'Aucune séance disponible pour le moment.'}</ActivitiesState></td>
    </tr>
  ) : filteredActivities.length === 0 ? (
    <tr role="row"><td colSpan={5}><ActivitiesState>Aucune activité ne correspond aux filtres sélectionnés.</ActivitiesState></td></tr>
  ) : (
    filteredActivities.map((activity) => (
      <tr key={activity.id} role="row">
        <td className="activity-date" role="cell" data-label="Date"><time dateTime={activity.date}>{formatActivityDate(activity.date)}</time></td>
        <td className="activity-equipment" role="cell" data-label="Équipement">
          <span className="activity-equipment-symbol" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9" /></svg>
          </span>
          {activity.equipmentType === 'TREADMILL'
            ? 'Tapis de course'
            : activity.equipmentType}
        </td>
        <td className="activity-duration" role="cell" data-label="Durée"><strong>{activity.durationMinutes}</strong> <span className="activity-unit">min</span></td>
        <td className="activity-distance" role="cell" data-label="Distance"><strong>{activity.distanceKm}</strong> <span className="activity-unit">km</span></td>
        <td className="activity-action" role="cell">
          <button
            type="button"
            className="view-activity-button"
            onClick={() => setSelectedActivity(activity)}
            aria-label={`Voir les détails de la séance du ${formatActivityDate(activity.date)}`}
          >
            Voir les détails <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
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
  demonstration={demonstration}
  onClose={() => setSelectedActivity(null)}
/>
    </div>
  )
}

function LiveActivities() {
  const state = useActivities()
  return <ActivitiesView {...state} />
}

export default function ActivitiesPage() {
  const liveActivities = <LiveActivities />
  const renderPage = (content, actions) => <ActivitiesLayout actions={actions}>{content}</ActivitiesLayout>
  if (import.meta.env.DEV) {
    return (
      <Suspense fallback={renderPage(liveActivities)}>
        <ActivitiesPreview renderActivities={state => <ActivitiesView {...state} />} renderPage={renderPage}>
          {liveActivities}
        </ActivitiesPreview>
      </Suspense>
    )
  }
  return renderPage(liveActivities)
}
