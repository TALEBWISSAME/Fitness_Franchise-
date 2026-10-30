import { useEffect, useState } from 'react'
import { getApi } from '../api.js'
import { useAuth } from '../authContext.js'
import StatisticsPage from '../pages/StatisticsPage.jsx'
import WeeklyGoal from './WeeklyGoal.jsx'

export default function ConnectedStatistics({ onNavigate }) {
  const { user, loading: authLoading } = useAuth()
  const [filters, setFilters] = useState({ from: '', to: '', equipmentType: '' })
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    let timer
    async function load() {
      try {
        const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
        const trend = await getApi(`/me/activity-trend?${query}`, controller.signal)
        // Use the exact period resolved by the server for both requests.
        query.set('from', trend.from); query.set('to', trend.to)
        const summary = await getApi(`/me/activity-summary?${query}`, controller.signal)
        if (!controller.signal.aborted) setState({ filters, loading: false, error: '', data: {
          summary: { sessionCount: summary.totalSessions, durationMinutes: summary.totalDurationMinutes, distanceKm: summary.totalDistanceKm },
          weeks: trend.weeks.map(week => ({ startDate: week.weekStart, endDate: week.weekEnd, sessionCount: week.totalSessions, partial: week.partial })),
        } })
      } catch (err) {
        if (!controller.signal.aborted) setState({ filters, data: null, loading: false, error: err.message })
      } finally { if (!controller.signal.aborted) timer = setTimeout(load, 5000) }
    }
    load()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [user, filters, retry])
  return <>
    {user && <section className="card statistics-filters"><h2>Période des statistiques</h2>
      <div className="activity-filters-form">
        {['from', 'to'].map(name => <div className="auth-field" key={name}><label htmlFor={`stats-${name}`}>{name === 'from' ? 'Date de début' : 'Date de fin'}</label>
          <input id={`stats-${name}`} type="date" value={filters[name]} onChange={event => setFilters(previous => ({ ...previous, [name]: event.target.value }))} /></div>)}
        <div className="auth-field"><label htmlFor="stats-equipment">Équipement</label><select id="stats-equipment" value={filters.equipmentType} onChange={event => setFilters(previous => ({ ...previous, equipmentType: event.target.value }))}>
          <option value="">Tous</option><option value="TREADMILL">Tapis</option><option value="BIKE">Vélo</option><option value="ELLIPTICAL">Elliptique</option>
        </select></div>
        <button className="button-outline" type="button" onClick={() => setFilters({ from: '', to: '', equipmentType: '' })}>Réinitialiser</button>
      </div><p>Sans dates : les quatre semaines calendaires, semaine courante incluse.</p></section>}
    <StatisticsPage onNavigate={onNavigate} onRetry={() => setRetry(previous => previous + 1)} user={user} {...(user ? (state.filters === filters ? state : { data: null, loading: true, error: '' }) : { data: null, error: '', loading: authLoading })} />
    {user && <WeeklyGoal />}
  </>
}
