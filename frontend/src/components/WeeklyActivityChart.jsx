import { useId, useRef, useState } from 'react'
import { formatStatisticsDay } from '../utils/activityStatistics.js'

export default function WeeklyActivityChart({ weeks }) {
  const titleId = useId()
  const helpId = useId()
  const tooltipId = useId()
  const gradientId = useId()
  const buttons = useRef([])
  const [hovered, setHovered] = useState(null)
  const [focused, setFocused] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const activeIndex = dismissed ? null : hovered ?? focused
  const activeWeek = activeIndex === null ? null : weeks[activeIndex]
  // Échelle visuelle uniquement : les comptes fournis restent inchangés.
  const step = Math.max(1, Math.ceil(Math.max(2, ...weeks.map(week => week.sessionCount)) / 2))
  const maximum = step * 2
  const ticks = [0, step, maximum]
  const plotTop = 18
  const plotBottom = 172
  const y = value => plotBottom - value / maximum * (plotBottom - plotTop)
  const points = weeks.map((week, index) => ({ x: (index + 0.5) * 800 / weeks.length, y: y(week.sessionCount) }))
  // Segments droits : aucune interpolation ne modifie la lecture des valeurs.
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = points.length
    ? `${linePath} L ${points.at(-1).x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`
    : ''

  function handleKeyDown(event, index) {
    if (event.key === 'Escape') {
      setDismissed(true)
      event.preventDefault()
      event.stopPropagation()
      return
    }
    const next = event.key === 'ArrowRight' ? Math.min(index + 1, weeks.length - 1)
      : event.key === 'ArrowLeft' ? Math.max(index - 1, 0)
        : event.key === 'Home' ? 0 : event.key === 'End' ? weeks.length - 1 : null
    if (next !== null) {
      event.preventDefault()
      buttons.current[next]?.focus()
    }
  }

  return (
    <figure className="card weekly-chart training-chart" aria-labelledby={titleId} aria-describedby={helpId}>
      <figcaption className="statistics-chart-heading">
        <div><h2 id={titleId}>Rythme d’entraînement</h2><p>Quatre semaines calendaires · Europe/Paris</p></div>
        <span className="statistics-chart-legend"><span aria-hidden="true" />Séances par semaine</span>
      </figcaption>
      <p className="training-chart-help" id={helpId}>Survolez ou touchez une semaine pour afficher sa valeur. Au clavier : Tab ou flèches pour parcourir les semaines, Échap pour fermer l’infobulle.</p>
      <div className="training-chart-canvas">
        <div className="training-chart-axis" aria-hidden="true">
          {ticks.map(value => <span key={value} style={{ top: `${y(value)}px` }}>{value}</span>)}
        </div>
        <div className="training-chart-stage" onPointerLeave={() => setHovered(null)}>
          <svg className="training-chart-svg" viewBox="0 0 800 190" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity=".18" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity=".015" />
              </linearGradient>
            </defs>
            {ticks.map(value => <line className="training-chart-grid" key={value} x1="0" x2="800" y1={y(value)} y2={y(value)} />)}
            <path className="training-chart-area" d={areaPath} fill={`url(#${gradientId})`} />
            {activeWeek && <line className="training-chart-guide" x1={points[activeIndex].x} x2={points[activeIndex].x} y1={plotTop - 8} y2={plotBottom} />}
            <path className="training-chart-line" d={linePath} />
          </svg>
          {points.map((point, index) => (
            <span key={weeks[index].startDate} className="training-chart-point" data-active={activeIndex === index}
              style={{ left: `${point.x / 800 * 100}%`, top: `${point.y}px` }} aria-hidden="true" />
          ))}
          <div className="training-chart-targets" role="group" aria-label="Explorer les quatre semaines">
            {weeks.map((week, index) => (
              <button
                key={week.startDate}
                ref={element => { buttons.current[index] = element }}
                className="training-chart-target"
                type="button"
                style={{ left: `${index / weeks.length * 100}%`, width: `${100 / weeks.length}%` }}
                aria-label={`Du ${formatStatisticsDay(week.startDate, true)} au ${formatStatisticsDay(week.endDate, true)} : ${week.sessionCount} séance${week.sessionCount === 1 ? '' : 's'}`}
                aria-describedby={activeIndex === index ? tooltipId : undefined}
                onPointerEnter={event => { if (event.pointerType !== 'touch') { setHovered(index); setDismissed(false) } }}
                onFocus={() => { setFocused(index); setHovered(null); setDismissed(false) }}
                onBlur={() => setFocused(null)}
                onClick={() => { setFocused(index); setDismissed(false) }}
                onKeyDown={event => handleKeyDown(event, index)}
              />
            ))}
          </div>
          {activeWeek && (
            <div className="training-chart-tooltip" role="tooltip" id={tooltipId}
              style={{ left: `clamp(106px, ${(activeIndex + 0.5) / weeks.length * 100}%, calc(100% - 106px))` }}>
              <span>Du {formatStatisticsDay(activeWeek.startDate, true)} au {formatStatisticsDay(activeWeek.endDate, true)}</span>
              <strong><span aria-hidden="true" />{activeWeek.sessionCount} séance{activeWeek.sessionCount === 1 ? '' : 's'}</strong>
            </div>
          )}
        </div>
        <div className="training-chart-labels" aria-hidden="true">
          {weeks.map(week => <div key={week.startDate}><span>Du {formatStatisticsDay(week.startDate)}</span><span>au {formatStatisticsDay(week.endDate)}</span></div>)}
        </div>
      </div>
      <details className="training-chart-details">
        <summary>Voir les données détaillées<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m8 10 4 4 4-4" /></svg></summary>
      <table className="statistics-week-table">
        <caption>Détail par semaine · lundi au dimanche</caption>
        <thead><tr><th scope="col">Semaine</th><th scope="col">Séances</th></tr></thead>
        <tbody>
          {weeks.map(week => (
            <tr key={week.startDate}>
              <th scope="row">Du {formatStatisticsDay(week.startDate, true)} au {formatStatisticsDay(week.endDate, true)}</th>
              <td>{week.sessionCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </details>
    </figure>
  )
}
