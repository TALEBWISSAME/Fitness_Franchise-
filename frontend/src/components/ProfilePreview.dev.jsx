import { useState } from 'react'

// Présentation uniquement : aucune donnée ne sort de ce composant de développement.
export default function ProfilePreview({ children }) {
  const [preview, setPreview] = useState(false)

  return (
    <>
      {!preview && children}
      <div className="auth-notice profile-preview">
      {preview && (
        <div>
          <p className="auth-error" role="status">
            <strong>Aperçu fictif — aucun compte connecté</strong>
          </p>
          <dl className="profile-details">
            <div><dt>Nom d’affichage</dt><dd>Adhérent Démo</dd></div>
            <div><dt>Email</dt><dd>demo@example.com</dd></div>
            <div><dt>Date de naissance</dt><dd>2000-05-15</dd></div>
            <div><dt>Sexe / genre</dt><dd>Non renseigné</dd></div>
            <div><dt>Identifiant du compte</dt><dd>1</dd></div>
          </dl>
        </div>
      )}
      <button
        className="api-button"
        type="button"
        aria-expanded={preview}
        onClick={() => setPreview(current => !current)}
      >
        {preview ? 'Quitter l’aperçu' : 'Prévisualiser le profil'}
      </button>
      </div>
    </>
  )
}
