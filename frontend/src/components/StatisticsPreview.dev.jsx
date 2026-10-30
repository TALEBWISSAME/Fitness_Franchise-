import { useState } from 'react'
import { previewActivities } from '../dev/activities.js'
import { buildActivityStatistics, getPreviewReferenceDay } from '../utils/activityStatistics.js'

export default function StatisticsPreview({ children, renderStatistics, renderPage }) {
  const [preview, setPreview] = useState(false)
  // Fenêtre stable : semaine de la séance la plus récente + trois précédentes.
  const data = buildActivityStatistics(previewActivities, getPreviewReferenceDay(previewActivities))

  const controls = (
      <div className="statistics-preview-actions">
        {preview && <span className="statistics-demo-badge" role="status" title="Aperçu fictif — aucune donnée réelle">Données de démonstration</span>}
        <button className="button-secondary" type="button" aria-pressed={preview} onClick={() => setPreview(current => !current)}>
          {preview ? 'Quitter l’aperçu' : 'Prévisualiser les statistiques'}
        </button>
      </div>
  )
  return renderPage(
    preview ? <>{renderStatistics(data)}<p className="statistics-preview-note">Aperçu fictif, sans compte connecté. Mêmes séances que l’aperçu Activités ; quatre semaines se terminant par celle de la séance la plus récente.</p></> : children,
    controls,
  )
}
