import { useState } from 'react'
import { validateRegistration } from '../validation/registration.js'
import { writeApi } from '../api.js'
import { useAuth } from '../authContext.js'

export default function AuthForm({ mode, onNavigate }) {
  const registering = mode === 'register'
  const { login } = useAuth()
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
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
        onNavigate('profile')
      }
    } catch (err) { setError(err instanceof TypeError ? 'Connexion au serveur impossible.' : err.message) }
    finally { setBusy(false) }
  }
  return <section className="card auth-card" aria-busy={busy}>
    <h1>{registering ? 'Créer mon compte' : 'Se connecter'}</h1>
    <form noValidate onSubmit={submit}>
      <p className="auth-hint">Tous les champs sont obligatoires.{registering && ' Mot de passe : 12 à 64 caractères.'}</p>
      {fields.map(field => <div className="auth-field" key={field.name}>
        <label htmlFor={`${mode}-${field.name}`}>{field.label}</label>
        <input {...field} id={`${mode}-${field.name}`} required disabled={busy}
          aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${mode}-${field.name}-error` : undefined} />
        {errors[field.name] && <p id={`${mode}-${field.name}-error`} className="auth-error" role="alert">{errors[field.name]}</p>}
      </div>)}
      <button className="api-button" disabled={busy} type="submit">{busy ? 'En cours…' : registering ? 'Créer mon compte' : 'Se connecter'}</button>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {success && <p role="status">Compte créé. Vous pouvez maintenant vous connecter.</p>}
    </form>
    <button className="button-outline" type="button" disabled={busy} onClick={() => onNavigate(registering ? 'login' : 'register')}>
      {registering ? 'Se connecter' : 'Créer un compte'}
    </button>
  </section>
}
