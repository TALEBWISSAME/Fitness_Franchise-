import { lazy, Suspense } from 'react'
import StatsCards from '../components/StatsCards.jsx'
import WeeklyActivityChart from '../components/WeeklyActivityChart.jsx'
import { formatStatisticsDay } from '../utils/activityStatistics.js'

const StatisticsPreview = import.meta.env.DEV
  ? lazy(() => import('../components/StatisticsPreview.dev.jsx'))
  : null

function StatisticsLayout({ children, actions, loading }) {
  return (
    <section className="statistics-dashboard" aria-labelledby="statistics-title" aria-busy={loading}>
      <header className="statistics-page-heading">
        <div>
          <h1 id="statistics-title">Mes statistiques</h1>
          <p>Votre activité, en quatre semaines.</p>
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

function StatisticsContent({ data }) {
  return (
    <div className="statistics-content">
      <p className="statistics-period"><span>Période analysée</span> Du {formatStatisticsDay(data.weeks[0].startDate, true)} au {formatStatisticsDay(data.weeks[3].endDate, true)}</p>
      <StatsCards summary={data.summary} />
      {data.summary.sessionCount === 0 && (
        <p className="statistics-empty-note" role="status">Aucune activité sur cette période. Vos indicateurs sont à zéro.</p>
      )}
      <WeeklyActivityChart weeks={data.weeks} />
    </div>
  )
}

// Modèle de présentation interne : { summary: { sessionCount, durationMinutes,
// distanceKm }, weeks: [{ startDate, endDate, sessionCount }] }.
// Un futur adaptateur API alimentera ces propriétés ; aucun DTO serveur supposé.
export default function StatisticsPage({ onNavigate, user = null, loading = false, error = '', data = null }) {
  let content
  if (loading) {
    content = <div className="statistics-state" role="status"><span className="statistics-state-mark" aria-hidden="true">…</span><div><h2>Chargement de vos statistiques…</h2><p>Votre bilan sera affiché ici.</p></div></div>
  } else if (error) {
    content = <div className="statistics-state statistics-state-error" role="alert"><span className="statistics-state-mark" aria-hidden="true">!</span><div><h2>Statistiques indisponibles</h2><p>Impossible de charger les statistiques : {error}</p></div></div>
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
  } else {
    content = <StatisticsContent data={data} />
  }

  const renderPage = (body, actions) => <StatisticsLayout actions={actions} loading={loading}>{body}</StatisticsLayout>
  return import.meta.env.DEV && !loading && !error && !user ? (
        <Suspense fallback={renderPage(content)}>
          <StatisticsPreview renderStatistics={previewData => <StatisticsContent data={previewData} />} renderPage={renderPage}>
            {content}
          </StatisticsPreview>
        </Suspense>
      ) : renderPage(content)
}
