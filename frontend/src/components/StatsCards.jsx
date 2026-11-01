export default function StatsCards({ summary }) {
  return (
    <div className="statistics-cards">
      {[
        ['Nombre de séances', summary.sessionCount, 'séances', 'M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2m2 10 2 2 4-4'],
        ['Durée totale', summary.durationMinutes, 'min', 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'],
        ['Distance totale', summary.distanceKm, 'km', 'M6 5h9a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h9M6 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0m16 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0'],
      ].map(([label, value, unit, iconPath]) => (
        <section className="card statistics-card" key={label}>
          <div className="statistics-kpi-heading">
            <h2>{label}</h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={iconPath} /></svg>
          </div>
          <p className="statistics-value">
            {value == null
              ? 'Non applicable'
              : <>{value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} <span>{unit}</span></>}
          </p>
        </section>
      ))}
    </div>
  )
}
