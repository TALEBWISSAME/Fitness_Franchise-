import { useEffect, useRef, useState } from 'react'
import { getApi } from '../api.js'
import useDialogFocus from '../hooks/useDialogFocus.js'

function ApiTestModal({ onClose }) {
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, onClose)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getApi('/health', controller.signal)
      .then(data => { if (!controller.signal.aborted) setResponse(data) })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(err instanceof TypeError ? 'Connexion au backend impossible.' : err.message)
        }
      })
    return () => controller.abort()
  }, [])

  return (
    <div className="api-modal-overlay">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="api-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
      >
        <div className="api-modal-header">
          <h2 id="api-modal-title">
            Test de connexion à l'API
          </h2>
          <button
            type="button"
            className="api-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="api-modal-result">
          <div className="api-success-icon">{error ? '×' : response ? '✓' : '…'}</div>
          <h3>{error ? 'Connexion échouée' : response ? 'Connexion réussie !' : 'Test en cours…'}</h3>
          {error && <p role="alert">{error}</p>}
        </div>

        <div className="api-response">
          <h4>Réponse de l'API :</h4>
          <pre>{response ? JSON.stringify(response, null, 2) : 'En attente de la réponse'}</pre>
        </div>

        <div className="api-modal-footer">
          <button
            type="button"
            className="api-modal-button"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiTestModal
