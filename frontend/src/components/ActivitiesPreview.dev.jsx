import { useState } from 'react'
import { previewActivities as activities } from '../dev/activities.js'

// Module chargé uniquement en développement. Jamais de fusion avec l’API,
// de session, de stockage ou d’envoi réseau pour ces données de présentation.

export default function ActivitiesPreview({ children, renderActivities, renderPage }) {
  const [preview, setPreview] = useState(false)

  const controls = (
      <div className="activities-preview-actions">
        {preview && (
          <span className="activities-demo-badge" role="status" title="Aperçu fictif — aucune donnée réelle">Données de démonstration</span>
        )}
        <button className="button-secondary" type="button" aria-pressed={preview} onClick={() => setPreview(current => !current)}>
          {preview ? 'Quitter l’aperçu' : 'Prévisualiser les activités'}
        </button>
      </div>
  )
  return renderPage(
      preview ? (
        <div key="preview">
          {renderActivities({ activities, loading: false, error: '', demonstration: true })}
        </div>
      ) : (
        <div key="live">{children}</div>
      ),
      controls,
  )
}
