import { useState } from 'react'
import { validateRegistration } from '../validation/registration.js'
import { writeApi } from '../api.js'
import { useAuth } from '../authContext.js'
import gymBanner from '../assets/gym-banner.png'

export default function AuthForm({ mode, onNavigate }) {
  const registering = mode === 'register'
  const { login } = useAuth()
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const fields = [
    ...(registering ? [{ name: 'displayName', label: 'Nom d’affichage', type: 'text', autoComplete: 'nickname' }] : []),
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'password', label: 'Mot de passe', type: 'password', autoComplete: registering ? 'new-password' : 'current-password' },
    ...(registering ? [{ name: 'passwordConfirmation', label: 'Confirmer le mot de passe', type: 'password', autoComplete: 'new-password' }] : []),
  ]
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const invalid = registering ? validateRegistration(values) : {}
    for (const field of fields) {
      if (!values[field.name]?.trim()) invalid[field.name] = 'Ce champ est obligatoire.'
      if (form.elements.namedItem(field.name).validity.typeMismatch) invalid[field.name] = 'Adresse email invalide.'
    }
    setErrors(invalid); setError(''); setSuccess(false)
    if (Object.keys(invalid).length) { form.elements.namedItem(Object.keys(invalid)[0]).focus(); return }
    setBusy(true)
    try {
      if (registering) {
        await writeApi('/auth/register', { email: values.email.trim(), displayName: values.displayName.trim(), password: values.password })
        form.reset(); setSuccess(true)
      } else {
        await login(values.email.trim(), values.password)
        onNavigate('statistics')
      }
    } catch (err) { setError(err instanceof TypeError ? 'Le service est momentanément inaccessible. Réessayez dans un instant.' : err.message) }
    finally { setBusy(false) }
  }
  return <div className={`auth-layout ${registering ? 'register-page' : 'login-page'}`}>
    <aside className="auth-story" aria-label="Votre espace Fitness Franchise">
      <img className="auth-story-photo" src={gymBanner} alt="" />
      <div className="auth-story-content"><p className="auth-eyebrow">FITNESS FRANCHISE</p><h2>{registering ? <>Votre énergie.<br /><em>Un nouvel élan.</em></> : <>Discipline.<br />Progression.<br /><em>Résultats.</em></>}</h2><p>Un espace personnel pour retrouver vos séances, comprendre votre rythme et suivre vos objectifs.</p><div className="auth-story-benefits"><span>01 · Vos entraînements</span><span>02 · Votre progression</span><span>03 · Vos objectifs</span></div></div>
    </aside>
    <section className="card auth-card auth-form-card" aria-busy={busy} aria-labelledby={`${mode}-title`}>
    <p className="auth-eyebrow">{registering ? 'LE PREMIER PAS' : 'HEUREUX DE VOUS RETROUVER'}</p>
    <h1 id={`${mode}-title`}>{registering ? 'Créer mon espace' : 'Connexion'}</h1>
    <p className="auth-description">{registering ? 'Créez votre compte et donnez une place à chaque entraînement.' : 'Connectez-vous pour retrouver votre progression.'}</p>
    <form noValidate onSubmit={submit}>
      <p className="auth-hint">Tous les champs sont obligatoires.</p>
      {fields.map(field => <div className="auth-field" key={field.name}>
        <label htmlFor={`${mode}-${field.name}`}>{field.label}</label>
        <div className="auth-input-wrap"><svg className="login-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={field.name === 'displayName' ? 'M4 21c0-4 3-7 8-7s8 3 8 7M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0' : field.name === 'email' ? 'M4 5h16v14H4zM4 6l8 6 8-6' : 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4m-4 5v2'} /></svg><input name={field.name} autoComplete={field.autoComplete} type={field.type === 'password' && showPassword ? 'text' : field.type} id={`${mode}-${field.name}`} required disabled={busy}
          maxLength={field.name === 'displayName' ? 100 : field.name === 'email' ? 254 : registering ? 64 : undefined}
          aria-invalid={!!errors[field.name]} aria-describedby={[errors[field.name] ? `${mode}-${field.name}-error` : '', registering && field.name === 'password' ? 'registration-password-help' : ''].filter(Boolean).join(' ') || undefined}
          onChange={() => { setErrors(previous => ({ ...previous, [field.name]: undefined })); setError(''); setSuccess(false) }} />
          {field.name === 'password' && <button className="auth-reveal" type="button" disabled={busy} aria-label={showPassword ? 'Masquer les mots de passe' : 'Afficher les mots de passe'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Masquer' : 'Afficher'}</button>}
        </div>
        {registering && field.name === 'password' && <p className="auth-hint" id="registration-password-help">12 à 64 caractères, dans la limite de 72 octets UTF-8.</p>}
        {errors[field.name] && <p id={`${mode}-${field.name}-error`} className="auth-error" role="alert">{errors[field.name]}</p>}
      </div>)}
      <button className="api-button" disabled={busy} type="submit">{busy && <span className="ui-spinner" aria-hidden="true" />}{busy ? 'Veuillez patienter…' : registering ? 'Créer mon compte' : 'Accéder à mon espace'}<span aria-hidden="true">→</span></button>
      {error && <p className="ui-error" role="alert">{error}</p>}
      {success && <p className="ui-success" role="status">Compte créé avec succès. Connectez-vous pour commencer.</p>}
    </form>
    <p className="auth-switch">{registering ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'} <button type="button" disabled={busy} onClick={() => onNavigate(registering ? 'login' : 'register')}>{registering ? 'Se connecter' : 'Créer mon espace'}</button></p>
    <button className="auth-back" type="button" disabled={busy} onClick={() => onNavigate('home')}>← Retour à l’accueil</button>
    </section>
  </div>
}
