import { lazy, Suspense } from 'react'

// Vite élimine cette branche et son module du build de production.
const ProfilePreview = import.meta.env.DEV
  ? lazy(() => import('../components/ProfilePreview.dev.jsx'))
  : null

// Ces propriétés seront alimentées par GET /api/me. L’aperçu de présentation
// ne renseigne jamais user et ne crée aucune session.
export default function ProfilePage({ onNavigate, user = null, loading = false, error = '' }) {
  const signedOut = (
    <div className="profile-signed-out">
      <svg className="profile-account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" />
      </svg>
      <p className="auth-subtitle">Connectez-vous pour consulter les informations de votre compte.</p>
      <button className="api-button" type="button" onClick={() => onNavigate('login')}>
        Se connecter
      </button>
    </div>
  )

  return (
    <section className="card auth-card profile-card" aria-labelledby="profile-title" aria-busy={loading}>
      <h1 id="profile-title">Mon profil</h1>
      {loading ? (
        <p className="auth-feedback" role="status">Chargement de votre profil…</p>
      ) : error ? (
        <p className="auth-error" role="alert">{error}</p>
      ) : user ? (
      <dl className="profile-details">
        <div>
          <dt>Nom d’affichage</dt>
          <dd>{user.displayName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        {user.birthDate && (
          <div>
            <dt>Date de naissance</dt>
            <dd>{user.birthDate}</dd>
          </div>
        )}
        {user.gender && (
          <div>
            <dt>Sexe / genre</dt>
            <dd>{user.gender}</dd>
          </div>
        )}
        <div>
          <dt>Identifiant du compte</dt>
          <dd>{user.id}</dd>
        </div>
      </dl>
      ) : import.meta.env.DEV ? (
        <Suspense fallback={signedOut}>
          <ProfilePreview>{signedOut}</ProfilePreview>
        </Suspense>
      ) : signedOut}
    </section>
  )
}
