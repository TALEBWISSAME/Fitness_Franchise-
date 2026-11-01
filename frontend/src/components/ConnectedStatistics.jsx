import { useEffect, useState } from 'react'
import { getApi } from '../api.js'
import { useAuth } from '../authContext.js'
import StatisticsPage from '../pages/StatisticsPage.jsx'
import MemberExperienceShell from './MemberExperienceShell.jsx'
import WeeklyGoal from './WeeklyGoal.jsx'
import { getEquipmentTypeOptions, isEquipmentCatalog } from '../utils/equipmentCatalog.js'
import { summarizeActivityList } from '../utils/activityListSummary.js'

export default function ConnectedStatistics({ onNavigate }) {
  const { user, loading: authLoading } = useAuth()
  const [filters, setFilters] = useState({ from: '', to: '', equipmentType: '' })
  const [equipmentCatalog, setEquipmentCatalog] = useState([])
  const [equipmentError, setEquipmentError] = useState('')
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    getApi('/equipments', controller.signal)
      .then(data => {
        if (!isEquipmentCatalog(data)) throw new Error('Le catalogue des équipements est invalide.')
        if (!controller.signal.aborted) {
          setEquipmentCatalog(data)
          setEquipmentError('')
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setEquipmentCatalog([])
          setEquipmentError(error.message)
        }
      })
    return () => controller.abort()
  }, [user])
  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    let timer
    const refresh = () => setRetry(previous => previous + 1)
    window.addEventListener('activities-updated', refresh)
    async function load() {
      try {
        const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
        const trend = await getApi(`/me/activity-trend?${query}`, controller.signal)
        // Use the exact period resolved by the server for both requests.
        query.set('from', trend.from); query.set('to', trend.to)
        const [summary, activities] = await Promise.all([
          getApi(`/me/activity-summary?${query}`, controller.signal),
          getApi(`/activities?${query}`, controller.signal),
        ])
        if (!Array.isArray(activities)) throw new Error('La réponse des séances est invalide.')
        const distanceSummary = summarizeActivityList(activities)
        if (!controller.signal.aborted) setState({ requestedFilters: filters, loading: false, error: '', data: {
          summary: { sessionCount: summary.totalSessions, durationMinutes: summary.totalDurationMinutes, distanceKm: distanceSummary.distanceKm },
          weeks: trend.weeks.map(week => ({ startDate: week.weekStart, endDate: week.weekEnd, sessionCount: week.totalSessions, partial: week.partial })),
        } })
      } catch (err) {
        if (!controller.signal.aborted) setState({ requestedFilters: filters, data: null, loading: false, error: err.message })
      } finally { if (!controller.signal.aborted) timer = setTimeout(load, 5000) }
    }
    load()
    return () => {
      controller.abort()
      clearTimeout(timer)
      window.removeEventListener('activities-updated', refresh)
    }
  }, [user, filters, retry])

  const equipmentFilterOptions = getEquipmentTypeOptions(equipmentCatalog)
  return (
    <MemberExperienceShell activePage="statistics" onNavigate={onNavigate}>
      <StatisticsPage onNavigate={onNavigate} onRetry={() => setRetry(previous => previous + 1)} user={user}
        goal={user && <WeeklyGoal />}
        filters={user && <section className="card statistics-filters" aria-label="Filtres des statistiques">
          <div className="statistics-filter-heading">
            <span className="statistics-filter-icon" aria-hidden="true">⌁</span>
            <h2>Période et équipement</h2>
          </div>
          <div className="activity-filters-form">
            {['from', 'to'].map(name => <div className="auth-field" key={name}><label htmlFor={`stats-${name}`}>{name === 'from' ? 'Date de début' : 'Date de fin'}</label>
              <input id={`stats-${name}`} type="date" value={filters[name]} onChange={event => setFilters(previous => ({ ...previous, [name]: event.target.value }))} /></div>)}
            <div className="auth-field"><label htmlFor="stats-equipment">Équipement</label><select id="stats-equipment" value={filters.equipmentType} onChange={event => setFilters(previous => ({ ...previous, equipmentType: event.target.value }))}>
              <option value="">Tous</option>{equipmentFilterOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select></div>
            <button className="button-outline" type="button" onClick={() => setFilters({ from: '', to: '', equipmentType: '' })}>Réinitialiser</button>
          </div><p>Sans dates : les quatre semaines calendaires, semaine courante incluse.</p>
          {equipmentError && <p role="status">Le catalogue est indisponible ; seuls les filtres d’équipement historiques sont proposés.</p>}
        </section>}
        {...(user
          ? state.requestedFilters === filters
            ? { data: state.data, loading: state.loading, error: state.error }
            : { data: null, loading: true, error: '' }
          : { data: null, error: '', loading: authLoading })} />
    </MemberExperienceShell>
  )
}
