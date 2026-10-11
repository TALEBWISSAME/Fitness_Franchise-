
function ApiTestModal({ onClose }) {
  // Données fictives pour tester l'interface uniquement
  const mockResponse = {
    status: 'UP',
    message: 'Fitness Franchise API is running',
    timestamp: '2026-10-11T14:32:10'
  }

  return (
    <div className="api-modal-overlay">
      <div
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
          <div className="api-success-icon">✓</div>
          <h3>Connexion réussie !</h3>
          <p>
            Simulation : réponse fictive du backend.
          </p>
          <span className="api-demo-label">
            Mode démonstration
          </span>
        </div>

        <div className="api-response">
          <h4>Réponse de l'API (simulée) :</h4>
          <pre>{JSON.stringify(mockResponse, null, 2)}</pre>
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
