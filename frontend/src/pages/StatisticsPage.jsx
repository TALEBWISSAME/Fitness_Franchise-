import { Component, lazy, Suspense } from 'react'
import StatsCards from '../components/StatsCards.jsx'
import WeeklyActivityChart from '../components/WeeklyActivityChart.jsx'
import { formatStatisticsDay } from '../utils/activityStatistics.js'
import './StatisticsPage.css'

const StatisticsPreview = import.meta.env.DEV
  ? lazy(() => import('../components/StatisticsPreview.dev.jsx'))
  : null

function isValidStatisticsData(data) {
  return Boolean(data)
    && Boolean(data.summary)
    && Number.isFinite(data.summary.sessionCount)
    && Number.isFinite(data.summary.durationMinutes)
    && (data.summary.distanceKm === null || Number.isFinite(data.summary.distanceKm))
    && Array.isArray(data.weeks)
    && data.weeks.every(week =>
      week
      && typeof week.startDate === 'string'
      && typeof week.endDate === 'string'
      && Number.isFinite(week.sessionCount))
}

class StatisticsContentBoundary extends Component {
  state = { hasError: false, resetKey: this.props.resetKey }

  static getDerivedStateFromProps(props, state) {
    if (state.hasError && props.resetKey !== state.resetKey) {
      return { hasError: false, resetKey: props.resetKey }
    }
    return null
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erreur lors du rendu des statistiques.', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="statistics-state statistics-state-error" role="alert">
          <span className="statistics-state-mark" aria-hidden="true">!</span>
          <div>
            <h2>Impossible d’afficher vos statistiques</h2>
            <p>Une erreur est survenue pendant l’affichage. Réessayez pour recharger vos données.</p>
            {this.props.onRetry && <button className="button-outline" type="button" onClick={this.props.onRetry}>Réessayer</button>}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function StatisticsLayout({ children, actions, filters, loading }) {
  return (
    <section className="statistics-dashboard" aria-labelledby="statistics-title" aria-busy={loading}>
      <header className="statistics-page-heading">
        <div>
          <p className="statistics-eyebrow">Mes statistiques</p>
          <h1 id="statistics-title">Suivez votre <span>progression.</span></h1>
          <p>Votre activité, en quatre semaines.</p>
        </div>
        {actions}
      </header>
      {filters}
      {children}
    </section>
  )
}

function StatisticsContent({ data }) {
  const firstWeek = data.weeks[0]
  const lastWeek = data.weeks.at(-1)

  return (
    <>
      {firstWeek && lastWeek
        ? <p className="statistics-period"><span>Période analysée</span> Du {formatStatisticsDay(firstWeek.startDate, true)} au {formatStatisticsDay(lastWeek.endDate, true)}</p>
        : <p className="statistics-empty-note" role="status">Aucune semaine à afficher pour cette période.</p>}
      {data.weeks.some(week => week.partial) && <p>La première ou la dernière semaine est partiellement couverte par les filtres.</p>}
      <StatsCards summary={data.summary} />
      {data.summary.sessionCount === 0 && (
        <p className="statistics-empty-note" role="status">Aucune activité sur cette période. Vos indicateurs sont à zéro.</p>
      )}
      <WeeklyActivityChart weeks={data.weeks} />
    </>
  )
}

// Modèle de présentation interne : { summary: { sessionCount, durationMinutes,
// distanceKm }, weeks: [{ startDate, endDate, sessionCount }] }.
// Un futur adaptateur API alimentera ces propriétés ; aucun DTO serveur supposé.
export default function StatisticsPage({ onNavigate, onRetry, user = null, loading = false, error = '', data = null, filters = null, goal = null }) {
  let content
  if (loading) {
    content = <div className="statistics-state" role="status"><span className="ui-spinner" aria-hidden="true" /><div><h2>Chargement de vos statistiques…</h2><p>Nous préparons votre bilan personnel.</p></div></div>
  } else if (error) {
    content = <div className="statistics-state statistics-state-error" role="alert"><span className="statistics-state-mark" aria-hidden="true">!</span><div><h2>Statistiques indisponibles</h2><p>{error}</p>{onRetry && <button className="button-outline" type="button" onClick={onRetry}>Réessayer</button>}</div></div>
  } else if (!user) {
    content = (
      <div className="statistics-state">
        <span className="statistics-state-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></svg>
        </span>
        <div><h2>Retrouvez votre bilan sportif</h2><p>Connectez-vous pour consulter vos statistiques personnelles.</p></div>
        <button className="button-primary" type="button" onClick={() => onNavigate('login')}>Se connecter</button>
      </div>
    )
  } else if (!data) {
    content = <div className="statistics-state" role="status"><span className="statistics-state-mark" aria-hidden="true">i</span><div><h2>Votre bilan sera bientôt disponible</h2><p>Le service de statistiques personnelles n’est pas encore disponible.</p></div></div>
  } else if (!isValidStatisticsData(data)) {
    content = (
      <div className="statistics-state statistics-state-error" role="alert">
        <span className="statistics-state-mark" aria-hidden="true">!</span>
        <div>
          <h2>Statistiques indisponibles</h2>
          <p>Les données reçues sont incomplètes ou invalides. Réessayez dans un instant.</p>
          {onRetry && <button className="button-outline" type="button" onClick={onRetry}>Réessayer</button>}
        </div>
      </div>
    )
  } else {
    content = (
      <StatisticsContentBoundary resetKey={data} onRetry={onRetry}>
        <StatisticsContent data={data} />
      </StatisticsContentBoundary>
    )
  }

  const renderPage = (body, actions) => (
    <StatisticsLayout actions={actions} filters={filters} loading={loading}>
      <div className="statistics-content">{body}{user && goal}</div>
    </StatisticsLayout>
  )
  return import.meta.env.DEV && !loading && !error && !user ? (
        <Suspense fallback={renderPage(content)}>
          <StatisticsPreview renderStatistics={previewData => <StatisticsContent data={previewData} />} renderPage={renderPage}>
            {content}
          </StatisticsPreview>
        </Suspense>
      ) : renderPage(content)
}
