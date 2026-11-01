import { lazy, Suspense, useEffect, useState } from 'react'
import { getApi, writeApi } from '../api.js'
import ActivityDetailsModal from '../components/ActivityDetailsModal.jsx'
import useActivities from '../hooks/useActivities.js'
import { emptyActivityFilters, filterActivities, formatActivityDate, validateActivityFilters } from '../utils/activityFilters.js'
import {
  equipmentRequiresDistance,
  getEquipmentCategoryLabel,
  groupEquipmentByCategory,
  isEquipmentCatalog,
  getEquipmentTypeOptions,
} from '../utils/equipmentCatalog.js'
import { summarizeActivityList } from '../utils/activityListSummary.js'
import './ActivitiesPage.css'

const ActivitiesPreview = import.meta.env.DEV
  ? lazy(() => import('../components/ActivitiesPreview.dev.jsx'))
  : null
function getEquipmentLabel(type, equipmentCatalog, equipmentId) {
  return equipmentCatalog.find(equipment => equipment.id === equipmentId)?.name
    || equipmentCatalog.find(equipment => equipment.type === type)?.name
    || getEquipmentTypeOptions([]).find(equipment => equipment.value === type)?.label
    || type
}

function ActivitiesLayout({ children, actions }) {
  return (
    <section className="activities-dashboard" aria-labelledby="activities-title">
      <header className="activities-heading">
        <div>
          <h1 id="activities-title">Mes <span>séances</span></h1>
          <p>Enregistrez vos entraînements et suivez votre progression.</p>
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
  const [newActivity, setNewActivity] = useState({ date: '', equipmentId: '', durationMinutes: '', distanceKm: '' })
  const [equipmentCatalog, setEquipmentCatalog] = useState([])
  const [equipmentLoading, setEquipmentLoading] = useState(true)
  const [equipmentError, setEquipmentError] = useState('')
  const [equipmentRetry, setEquipmentRetry] = useState(0)
  const [savingActivity, setSavingActivity] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState(false)

  const filterError = validateActivityFilters(filters)
  const filteredActivities = filterActivities(activities, filters)
  const summary = summarizeActivityList(filteredActivities)
  const equipmentGroups = groupEquipmentByCategory(equipmentCatalog)
  const equipmentFilterOptions = getEquipmentTypeOptions(equipmentCatalog)
  const selectedEquipment = equipmentCatalog.find(equipment => String(equipment.id) === newActivity.equipmentId)
  const selectedEquipmentRequiresDistance = selectedEquipment
    ? equipmentRequiresDistance(selectedEquipment.type)
    : false

  function retryEquipmentLoad() {
    setEquipmentLoading(true)
    setEquipmentError('')
    setEquipmentRetry(previous => previous + 1)
  }

  useEffect(() => {
    const controller = new AbortController()

    getApi('/equipments', controller.signal)
      .then(data => {
        if (!isEquipmentCatalog(data)) throw new Error('La réponse du catalogue d’équipements est invalide.')
        if (data.length === 0) throw new Error('Aucun équipement n’est disponible dans le catalogue.')
        if (!controller.signal.aborted) setEquipmentCatalog(data)
      })
      .catch(requestError => {
        if (!controller.signal.aborted) {
          setEquipmentError(requestError instanceof TypeError
            ? 'Impossible de charger les équipements. Vérifiez votre connexion puis réessayez.'
            : requestError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setEquipmentLoading(false)
      })

    return () => controller.abort()
  }, [equipmentRetry])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters(previous => ({ ...previous, [name]: value }))
  }

  function updateNewActivity(event) {
    const { name, value } = event.target
    setNewActivity(previous => ({
      ...previous,
      [name]: value,
      ...(name === 'equipmentId' ? { distanceKm: '' } : {}),
    }))
    setCreateError('')
    setCreateSuccess(false)
  }

  async function createActivity(event) {
    event.preventDefault()
    if (savingActivity || demonstration) return
    setSavingActivity(true)
    setCreateError('')
    setCreateSuccess(false)

    const durationMinutes = Number(newActivity.durationMinutes)
    const distanceKm = Number(newActivity.distanceKm)
    if (!newActivity.date || !selectedEquipment
      || !newActivity.durationMinutes.trim() || !Number.isInteger(durationMinutes) || durationMinutes < 1
      || (selectedEquipmentRequiresDistance
        && (!newActivity.distanceKm.trim() || !Number.isFinite(distanceKm) || distanceKm < 0))) {
      setCreateError('Vérifiez la date, l’équipement, la durée et, si nécessaire, la distance.')
      setSavingActivity(false)
      return
    }

    try {
      await writeApi('/activities', {
        equipmentId: selectedEquipment.id,
        durationMinutes,
        distanceKm: selectedEquipmentRequiresDistance ? distanceKm : null,
        date: `${newActivity.date}T00:00:00`,
      })
      setNewActivity({ date: '', equipmentId: '', durationMinutes: '', distanceKm: '' })
      setCreateSuccess(true)
      window.dispatchEvent(new Event('activities-updated'))
    } catch (requestError) {
      setCreateError(requestError.message)
    } finally {
      setSavingActivity(false)
    }
  }

  return (
    <div className="activities-content">
      {!loading && !filterError && !(error && activities.length === 0) && <section className="activities-summary" aria-labelledby="activities-summary-title">
        <h2 className="activities-sr-only" id="activities-summary-title">Résumé de la liste affichée</h2>
        <dl>
          <div>
            <dt><span className="activity-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 20v-5m5 5V11m5 9V7m5 13V3" /></svg></span><span>Nombre de séances</span></dt>
            <dd>{listNumber.format(summary.count)} <span>{summary.count === 1 ? 'séance' : 'séances'}</span></dd>
          </div>
          <div>
            <dt><span className="activity-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><span>Durée cumulée</span></dt>
            <dd>{summary.durationMinutes === null ? <span>Non disponible</span> : <>{listNumber.format(summary.durationMinutes)} <span>min</span></>}</dd>
          </div>
          <div>
            <dt><span className="activity-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m4 19 15-15 2 2L6 21Zm5-5 2 2m2-6 2 2m2-6 2 2" /></svg></span><span>Distance cumulée</span></dt>
            <dd>{summary.distanceKm === null ? <span>Non applicable</span> : <>{listNumber.format(summary.distanceKm)} <span>km</span></>}</dd>
          </div>
        </dl>
      </section>}

      <section className="activities-create-card" aria-labelledby="activity-create-title" aria-describedby="activity-create-note">
        <div className="activities-create-heading">
          <span className="activity-create-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <div>
            <h2 id="activity-create-title">Ajouter une séance</h2>
            <p id="activity-create-note">La date est enregistrée selon le calendrier Europe/Paris. Une distance est requise pour les équipements qui la mesurent.</p>
          </div>
        </div>
        <form className="activities-create-form" onSubmit={createActivity}>
          <fieldset disabled={savingActivity || demonstration || equipmentLoading || Boolean(equipmentError)} aria-label="Informations de la séance">
            <div className="auth-field">
              <label htmlFor="new-activity-date">Date</label>
              <input id="new-activity-date" name="date" type="date" required value={newActivity.date} onChange={updateNewActivity} />
            </div>
            <div className="auth-field">
              <label htmlFor="new-activity-equipment">Équipement</label>
              <select id="new-activity-equipment" name="equipmentId" required value={newActivity.equipmentId} onChange={updateNewActivity}>
                <option value="">{equipmentLoading ? 'Chargement des équipements…' : 'Choisir un équipement'}</option>
                {equipmentGroups.map(group => (
                  <optgroup key={group.category} label={group.label}>
                    {group.items.map(equipment => {
                      return <option key={equipment.id} value={equipment.id}>
                        {equipment.name} · {getEquipmentCategoryLabel(equipment.category)}
                      </option>
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="auth-field">
              <label htmlFor="new-activity-duration">Durée (min)</label>
              <input id="new-activity-duration" name="durationMinutes" type="number" min="1" step="1" required placeholder="Ex. 30" value={newActivity.durationMinutes} onChange={updateNewActivity} />
            </div>
            {selectedEquipmentRequiresDistance && <div className="auth-field">
              <label htmlFor="new-activity-distance">Distance (km)</label>
              <input id="new-activity-distance" name="distanceKm" type="number" min="0" step="0.01" required placeholder="Ex. 5,2" value={newActivity.distanceKm} onChange={updateNewActivity} />
            </div>}
          </fieldset>
          <button className="activities-create-submit" type="submit"
            disabled={savingActivity || demonstration || equipmentLoading || Boolean(equipmentError) || !selectedEquipment}
            aria-describedby="activity-create-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            {demonstration ? 'Aperçu seul' : savingActivity ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
        {equipmentLoading && <p className="activities-create-feedback" role="status">Chargement du catalogue d’équipements…</p>}
        {equipmentError && <div className="activities-create-load-error" role="alert">
          <p>{equipmentError}</p>
          <button className="button-outline" type="button" onClick={retryEquipmentLoad}>Réessayer</button>
        </div>}
        {!equipmentLoading && !equipmentError && !selectedEquipment && (
          <p className="activities-create-feedback" role="status">
            {equipmentCatalog.length} équipements chargés depuis le catalogue.
          </p>
        )}
        {!equipmentLoading && !equipmentError && selectedEquipment && (
          <p className="activities-create-feedback is-success" role="status">
            {selectedEquipment.name} · {getEquipmentCategoryLabel(selectedEquipment.category)}
            {selectedEquipmentRequiresDistance ? ' · Distance à renseigner.' : ' · Distance non applicable.'}
          </p>
        )}
        {createSuccess && <p className="activities-create-feedback is-success" role="status">Séance enregistrée avec succès.</p>}
        {createError && <p className="activities-create-feedback is-error" role="alert">{createError}</p>}
        {demonstration && <p className="activities-create-feedback" role="status">L’enregistrement est désactivé dans l’aperçu de démonstration.</p>}
      </section>

      <div className="activities-list">
        <div className="activities-list-heading">
          <h2>Journal des séances</h2>
          <p aria-live="polite">{loading ? 'Chargement…' : filterError ? 'Période à corriger' : error && activities.length === 0 ? 'Indisponible' : `${filteredActivities.length} séance${filteredActivities.length === 1 ? '' : 's'}`}</p>
        </div>
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
                {equipmentFilterOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
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
          {getEquipmentLabel(activity.equipmentType, equipmentCatalog, activity.equipmentId)}
        </td>
        <td className="activity-duration" role="cell" data-label="Durée"><strong>{activity.durationMinutes}</strong> <span className="activity-unit">min</span></td>
        <td className="activity-distance" role="cell" data-label="Distance">
          {activity.distanceKm == null
            ? <span>Non applicable</span>
            : <><strong>{activity.distanceKm}</strong> <span className="activity-unit">km</span></>}
        </td>
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
  equipmentName={selectedActivity && getEquipmentLabel(selectedActivity.equipmentType, equipmentCatalog, selectedActivity.equipmentId)}
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
