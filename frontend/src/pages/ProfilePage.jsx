import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useAuth } from '../authContext.js'
import BrandMark from '../components/BrandMark.jsx'
import './ProfilePage.css'

const ProfilePreview = import.meta.env.DEV
  ? lazy(() => import('../components/ProfilePreview.dev.jsx'))
  : null

const GENDER_OPTIONS = ['Femme', 'Homme', 'Autre', 'Préfère ne pas répondre']
const OBJECTIVE_OPTIONS = ['Remise en forme', 'Endurance', 'Renforcement musculaire', 'Mobilité', 'Bien-être']
const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024
const PROFILE_PHOTO_MAX_DIMENSION = 512
const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const NAV_ITEMS = [
  ['home', 'Accueil', 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9'],
  ['statistics', 'Mes statistiques', 'M4 19h16M6 16v-5m6 5V6m6 10V9'],
  ['activities', 'Mes séances', 'M4 12h4l2-6 4 12 2-6h4'],
  ['equipment', 'Catalogue', 'M4 7h16M4 12h16M4 17h16'],
  ['profile', 'Mon profil', 'M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
]

function ProfileIcon({ path, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

function ProfileAvatar({ photo, initial, className }) {
  return (
    <span className={className} aria-hidden="true">
      {photo ? <img src={photo} alt="" /> : initial}
    </span>
  )
}

function profilePhotoStorageKey(userId) {
  return `fitness-franchise-profile-photo-${encodeURIComponent(String(userId))}`
}

async function prepareProfilePhoto(file) {
  if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
    throw new Error('Choisissez une image JPG, PNG ou WebP.')
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    throw new Error('La photo ne peut pas dépasser 5 Mo.')
  }

  const image = await createImageBitmap(file)
  try {
    const scale = Math.min(1, PROFILE_PHOTO_MAX_DIMENSION / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Le traitement de la photo est indisponible.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const compressed = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82))
    if (!compressed) throw new Error('La photo n’a pas pu être traitée.')

    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('La photo n’a pas pu être lue.'))
      reader.onload = () => typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('La photo n’a pas pu être lue.'))
      reader.readAsDataURL(compressed)
    })
  } finally {
    image.close()
  }
}

function profileValues(user) {
  return {
    city: user?.city ?? '',
    gender: user?.gender ?? '',
    sportObjective: user?.sportObjective ?? '',
  }
}

function validateProfile(values) {
  const errors = {}
  if (values.city.length > 100) errors.city = 'La ville ne peut pas dépasser 100 caractères.'
  if (values.gender && !GENDER_OPTIONS.includes(values.gender)) errors.gender = 'Choisissez une valeur proposée.'
  if (values.sportObjective && !OBJECTIVE_OPTIONS.includes(values.sportObjective)) {
    errors.sportObjective = 'Choisissez un objectif proposé.'
  }
  return errors
}

function ProfileSidebar({ onNavigate, user, onLogout, loggingOut, logoutError, open }) {
  return (
    <aside className="profile-sidebar" id="profile-sidebar" aria-label="Navigation espace adhérent"
      data-open={open} aria-hidden={!open} inert={!open}>
      <button className="profile-brand" type="button" onClick={() => onNavigate('home')}
        aria-label="Fitness Franchise — Accueil">
        <BrandMark />
      </button>
      <nav className="profile-side-nav" aria-label="Navigation principale">
        {NAV_ITEMS.map(([page, label, icon]) => (
          <button key={page} className="profile-nav-link" type="button"
            aria-current={page === 'profile' ? 'page' : undefined}
            aria-label={label} title={label} onClick={() => onNavigate(page)}>
            <ProfileIcon path={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {user && (
        <div className="profile-sidebar-bottom">
          {logoutError && <p className="profile-logout-error" role="alert">{logoutError}</p>}
          <button className="profile-nav-link profile-logout-link" type="button"
            onClick={onLogout} disabled={loggingOut}>
            <ProfileIcon path="M10 17l5-5-5-5m5 5H3m9-9h8v18h-8" />
            <span>{loggingOut ? 'Déconnexion…' : 'Se déconnecter'}</span>
          </button>
        </div>
      )}
    </aside>
  )
}

function ProfileForm({ user, photo, onSavePhoto, onDeletePhoto, photoStorageError }) {
  const { updateProfile } = useAuth()
  const [values, setValues] = useState(() => profileValues(user))
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [photoSuccess, setPhotoSuccess] = useState('')
  const photoInput = useRef(null)
  const initial = (user.displayName || user.email || 'A').trim().charAt(0).toUpperCase()

  function changeField(event) {
    const { name, value } = event.target
    setValues(previous => ({ ...previous, [name]: value }))
    setFieldErrors(previous => ({ ...previous, [name]: undefined }))
    setError('')
    setSuccess('')
  }

  function cancelChanges() {
    setValues(profileValues(user))
    setFieldErrors({})
    setError('')
    setSuccess('')
  }

  async function submit(event) {
    event.preventDefault()
    if (saving) return

    const payload = {
      city: values.city.trim(),
      gender: values.gender,
      sportObjective: values.sportObjective,
    }
    const validationErrors = validateProfile(payload)
    setFieldErrors(validationErrors)
    setError('')
    setSuccess('')
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    try {
      const updatedProfile = await updateProfile(payload)
      setValues(profileValues(updatedProfile))
      setSuccess('Votre profil a été mis à jour.')
    } catch (requestError) {
      setError(requestError.status === 400
        ? 'Vérifiez les informations saisies puis réessayez.'
        : requestError instanceof TypeError
          ? 'Le service est momentanément inaccessible. Réessayez dans un instant.'
          : requestError.message || 'La mise à jour du profil a échoué.')
    } finally {
      setSaving(false)
    }
  }

  async function changePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setPhotoError('')
    setPhotoSuccess('')
    try {
      onSavePhoto(await prepareProfilePhoto(file))
      setPhotoSuccess('Votre photo a été enregistrée sur cet appareil.')
    } catch (photoRequestError) {
      setPhotoError(photoRequestError.message || 'La photo n’a pas pu être enregistrée.')
    }
  }

  function deletePhoto() {
    setPhotoError('')
    setPhotoSuccess('')
    try {
      onDeletePhoto()
      setPhotoSuccess('Votre photo a été supprimée.')
    } catch (photoRequestError) {
      setPhotoError(photoRequestError.message || 'La photo n’a pas pu être supprimée.')
    }
  }

  return (
    <div className="profile-layout">
      <aside className="profile-summary" aria-label="Identité du compte">
        <div className="profile-summary-heading">
          <span className="profile-icon-bubble"><ProfileIcon path="M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0" /></span>
          <h2>Mon compte</h2>
        </div>
        <div className="profile-person">
          <div className="profile-avatar-frame">
            <ProfileAvatar photo={photo} initial={initial} className="profile-avatar" />
            <button className="profile-photo-camera" type="button"
              aria-label={photo ? 'Modifier la photo de profil' : 'Ajouter une photo de profil'}
              onClick={() => photoInput.current?.click()}>
              <ProfileIcon path="M4 8h3l1.5-2h7L17 8h3v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </button>
          </div>
          <div className="profile-person-details">
            <h3>{user.displayName}</h3>
            <p>{user.email}</p>
            <span className="profile-member-status"><span />Adhérent actif</span>
            <div className="profile-photo-actions">
              <input ref={photoInput} className="profile-photo-input" type="file"
                accept="image/jpeg,image/png,image/webp" onChange={changePhoto} tabIndex={-1} aria-hidden="true" />
              <button className="profile-photo-edit" type="button" onClick={() => photoInput.current?.click()}>
                <ProfileIcon path="M4 8h3l1.5-2h7L17 8h3v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                {photo ? 'Modifier ma photo' : 'Ajouter ma photo'}
              </button>
              {photo && <button className="profile-photo-delete" type="button" onClick={deletePhoto}>
                Supprimer
              </button>}
            </div>
            <p className="profile-photo-storage-note">Photo enregistrée sur cet appareil.</p>
            {(photoError || photoStorageError) && (
              <p className="profile-photo-feedback profile-photo-feedback-error" role="alert">
                {photoError || photoStorageError}
              </p>
            )}
            {photoSuccess && <p className="profile-photo-feedback" role="status">{photoSuccess}</p>}
          </div>
        </div>
        <div className="profile-account-data">
          <div className="profile-account-row">
            <ProfileIcon path="M4 6h16v12H4zM8 10h8m-8 4h5" />
            <span>Identifiant</span>
            <strong>{user.id}</strong>
          </div>
          <div className="profile-account-row">
            <ProfileIcon path="M3 5h18v14H3zM4 6l8 7 8-7" />
            <span>Email</span>
            <strong title={user.email}>{user.email}</strong>
          </div>
        </div>
        <div className="profile-summary-promo">
          <img src="/images/home-premium/hero.png" alt="" />
          <div className="profile-summary-promo-content">
            <span className="profile-icon-bubble"><ProfileIcon path="M4 19v-5m5 5V9m5 10V5m5 14V3" /></span>
            <h3>Votre parcours compte.</h3>
            <p>Complétez vos informations pour un suivi plus précis et des recommandations personnalisées.</p>
          </div>
        </div>
      </aside>

      <form className="profile-form" onSubmit={submit} noValidate aria-busy={saving}>
        <div className="profile-form-heading">
          <span className="profile-icon-bubble profile-settings-icon">
            <ProfileIcon path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2m10-10h-2M4 12H2m17.07-7.07-1.42 1.42M6.35 17.65l-1.42 1.42m14.14 0-1.42-1.42M6.35 6.35 4.93 4.93" />
          </span>
          <div>
            <p className="profile-eyebrow">Informations personnelles</p>
            <p>Ces informations sont facultatives. Vous pouvez les modifier à tout moment.</p>
          </div>
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <label htmlFor="profile-display-name">Nom d’affichage</label>
            <div className="profile-input-wrap profile-readonly-field">
              <ProfileIcon path="M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0" />
              <input id="profile-display-name" type="text" value={user.displayName} readOnly aria-readonly="true" />
            </div>
            <span className="profile-field-count">{user.displayName?.length ?? 0}/100</span>
          </div>
          <div className="profile-field">
            <label htmlFor="profile-email">Adresse email</label>
            <div className="profile-input-wrap profile-readonly-field">
              <ProfileIcon path="M3 5h18v14H3zM4 6l8 7 8-7" />
              <input id="profile-email" type="email" value={user.email} readOnly aria-readonly="true" />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-city">Ville <span>(facultatif)</span></label>
            <div className="profile-input-wrap">
              <ProfileIcon path="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <input id="profile-city" name="city" type="text" autoComplete="address-level2"
                maxLength={100} value={values.city} onChange={changeField} disabled={saving}
                aria-invalid={Boolean(fieldErrors.city)}
                aria-describedby={fieldErrors.city ? 'profile-city-error' : 'profile-city-count'} />
            </div>
            <span className="profile-field-count" id="profile-city-count">{values.city.length}/100</span>
            {fieldErrors.city && <p className="profile-field-error" id="profile-city-error">{fieldErrors.city}</p>}
          </div>

          <div className="profile-field">
            <label htmlFor="profile-gender">Genre <span>(facultatif)</span></label>
            <div className="profile-input-wrap profile-select-wrap">
              <ProfileIcon path="M12 3v18m-5-5 5 5 5-5M7 6l5-3 5 3" />
              <select id="profile-gender" name="gender" value={values.gender} onChange={changeField}
                disabled={saving} aria-invalid={Boolean(fieldErrors.gender)}
                aria-describedby={fieldErrors.gender ? 'profile-gender-error' : undefined}>
                <option value="">Non renseigné</option>
                {GENDER_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <ProfileIcon className="profile-select-chevron" path="m7 10 5 5 5-5" />
            </div>
            {fieldErrors.gender && <p className="profile-field-error" id="profile-gender-error">{fieldErrors.gender}</p>}
          </div>

          <div className="profile-field profile-field-wide">
            <label htmlFor="profile-sport-objective">Objectif sportif <span>(facultatif)</span></label>
            <div className="profile-input-wrap profile-select-wrap">
              <ProfileIcon path="M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5m4-9v5h-5" />
              <select id="profile-sport-objective" name="sportObjective" value={values.sportObjective}
                onChange={changeField} disabled={saving}
                aria-invalid={Boolean(fieldErrors.sportObjective)}
                aria-describedby={fieldErrors.sportObjective ? 'profile-objective-error' : undefined}>
                <option value="">Aucun objectif renseigné</option>
                {OBJECTIVE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <ProfileIcon className="profile-select-chevron" path="m7 10 5 5 5-5" />
            </div>
            {fieldErrors.sportObjective && <p className="profile-field-error" id="profile-objective-error">{fieldErrors.sportObjective}</p>}
          </div>
        </div>

        <div className="profile-form-footer">
          <div className="profile-feedback" aria-live="polite">
            {error && <p className="profile-message profile-message-error" role="alert">{error}</p>}
            {success && <p className="profile-message profile-message-success" role="status">
              <span aria-hidden="true">✓</span>{success}
            </p>}
          </div>
          <div className="profile-actions">
            <button className="profile-cancel-button" type="button" onClick={cancelChanges} disabled={saving}>
              Annuler
            </button>
            <button className="profile-save-button" type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function ProfilePage({ onNavigate, user = null, loading = false, error = '' }) {
  const { logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(() => window.matchMedia('(min-width: 641px)').matches)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [storedPhoto, setStoredPhoto] = useState(() => {
    if (!user) return { userId: null, data: '', error: '' }
    try {
      return {
        userId: user.id,
        data: localStorage.getItem(profilePhotoStorageKey(user.id)) ?? '',
        error: '',
      }
    } catch {
      return {
        userId: user.id,
        data: '',
        error: 'Le stockage des photos est inaccessible dans ce navigateur.',
      }
    }
  })
  const profilePhoto = storedPhoto.userId === user?.id ? storedPhoto.data : ''

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 641px)')
    const syncMenuToViewport = event => setMenuOpen(event.matches)
    desktop.addEventListener('change', syncMenuToViewport)
    return () => desktop.removeEventListener('change', syncMenuToViewport)
  }, [])

  function saveProfilePhoto(data) {
    localStorage.setItem(profilePhotoStorageKey(user.id), data)
    setStoredPhoto({ userId: user.id, data, error: '' })
  }

  function deleteProfilePhoto() {
    localStorage.removeItem(profilePhotoStorageKey(user.id))
    setStoredPhoto({ userId: user.id, data: '', error: '' })
  }

  function navigateFromMenu(page) {
    setMenuOpen(window.matchMedia('(min-width: 641px)').matches)
    onNavigate(page)
  }

  async function signOut() {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      onNavigate('login')
    } catch {
      setLogoutError('Déconnexion impossible. Réessayez.')
    } finally {
      setLoggingOut(false)
    }
  }

  const signedOut = (
    <div className="profile-signed-out">
      <div className="profile-signed-out-mark" aria-hidden="true">FF</div>
      <h2>Connectez-vous à votre espace</h2>
      <p>Votre profil personnel est accessible après connexion.</p>
      <button className="profile-save-button" type="button" onClick={() => onNavigate('login')}>
        Se connecter
      </button>
    </div>
  )

  return (
    <section className="member-profile" aria-labelledby="profile-title" aria-busy={loading}
      data-menu-open={menuOpen}>
      <button className="profile-menu-backdrop" type="button" aria-label="Fermer le menu"
        tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
      <ProfileSidebar onNavigate={navigateFromMenu} user={user} onLogout={signOut}
        loggingOut={loggingOut} logoutError={logoutError} open={menuOpen} />
      <div className="profile-content-column">
        <header className="profile-topbar">
          <button className="profile-topbar-menu" type="button"
            aria-expanded={menuOpen} aria-controls="profile-sidebar"
            aria-label={menuOpen ? 'Réduire ou fermer le menu latéral' : 'Ouvrir le menu latéral'}
            onClick={() => setMenuOpen(open => !open)}>
            <ProfileIcon path={menuOpen ? 'm6 6 12 12M6 18 18 6' : 'M3 8h18M3 16h18'} />
            <span>Menu</span>
          </button>
          <div className="profile-topbar-account">
            <span className="profile-notification" aria-label="Notifications">
              <ProfileIcon path="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0" />
              <span aria-hidden="true" />
            </span>
            <ProfileAvatar photo={profilePhoto}
              initial={(user?.displayName || user?.email || 'A').trim().charAt(0).toUpperCase()}
              className="profile-topbar-avatar" />
            <span className="profile-topbar-name">{user?.displayName || 'Invité'}</span>
            <ProfileIcon className="profile-topbar-chevron" path="m7 10 5 5 5-5" />
          </div>
        </header>

        <main className="profile-main">
          <header className="profile-hero">
            <img className="profile-hero-image" src="/images/fitness-premium/gym-interior.png" alt="" />
            <div className="profile-page-heading">
              <p className="profile-eyebrow">Espace adhérent</p>
              <h1 id="profile-title">Mon <span>profil.</span></h1>
              <p>Gérez les informations associées à votre espace Fitness Franchise.</p>
            </div>
          </header>
          {loading ? (
            <p className="profile-loading" role="status">Chargement de votre profil…</p>
          ) : error ? (
            <p className="profile-message profile-message-error" role="alert">{error}</p>
          ) : user ? (
            <ProfileForm user={user} photo={profilePhoto} onSavePhoto={saveProfilePhoto}
              onDeletePhoto={deleteProfilePhoto} photoStorageError={storedPhoto.error} />
          ) : import.meta.env.DEV ? (
            <Suspense fallback={signedOut}>
              <ProfilePreview>{signedOut}</ProfilePreview>
            </Suspense>
          ) : signedOut}
        </main>
      </div>
    </section>
  )
}
