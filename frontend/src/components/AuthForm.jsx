import { useState } from 'react'
import { validateRegistration } from '../validation/registration.js'

function getToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default function AuthForm({ mode, onNavigate }) {
  const registering = mode === 'register'
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [today, setToday] = useState(getToday)
  const fields = [
    ...(registering ? [{ name: 'displayName', label: "Nom d’affichage", type: 'text', autoComplete: 'nickname' }] : []),
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    ...(registering ? [
      { name: 'birthDate', label: 'Date de naissance', type: 'date', autoComplete: 'bday', max: today },
      { name: 'gender', label: 'Sexe / genre', type: 'select', optional: true },
    ] : []),
    { name: 'password', label: 'Mot de passe', type: 'password', autoComplete: registering ? 'new-password' : 'current-password' },
    ...(registering ? [{ name: 'passwordConfirmation', label: 'Confirmer le mot de passe', type: 'password', autoComplete: 'new-password' }] : []),
  ]

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const submissionDate = getToday()
    setToday(submissionDate)
    const nextErrors = registering
      ? validateRegistration(Object.fromEntries(new FormData(form)), submissionDate)
      : {}

    for (const field of fields) {
      const input = form.elements.namedItem(field.name)
      if (!registering && !input.value.trim()) {
        nextErrors[field.name] = `${field.label} : ce champ est obligatoire.`
      } else if (input.validity.typeMismatch && !nextErrors[field.name]) {
        nextErrors[field.name] = 'Saisissez une adresse email valide.'
      }
      if (registering && field.type === 'date' && input.validity.badInput) {
        nextErrors[field.name] = 'Saisissez une date de naissance valide.'
      }
    }

    setErrors(nextErrors)
    setSubmitted(Object.keys(nextErrors).length === 0)
    const firstInvalid = fields.find(field => nextErrors[field.name])
    if (firstInvalid) form.elements.namedItem(firstInvalid.name).focus()
  }

  return (
    <section className="card auth-card" aria-labelledby={`${mode}-title`}>
      <h1 id={`${mode}-title`}>{registering ? 'Créer mon compte' : 'Bon retour !'}</h1>
      <p className="auth-subtitle">
        {registering
          ? 'Rejoignez Fitness Franchise et préparez votre espace personnel.'
          : 'Connectez-vous pour retrouver votre espace sportif.'}
      </p>
      <form noValidate onSubmit={handleSubmit} aria-describedby={`${mode}-notice`}>
        <p className="auth-hint">{registering ? 'Tous les champs sont obligatoires, sauf le sexe / genre.' : 'Tous les champs sont obligatoires.'}</p>
        {registering && (
          <p className="auth-hint" id="register-proposal">
            Proposition à discuter avec l’équipe : date de naissance obligatoire, sexe / genre facultatif et mot de passe de 8 caractères minimum. Aucun âge minimum imposé.
          </p>
        )}
        {fields.map(field => {
          const id = `${mode}-${field.name}`
          return (
            <div className="auth-field" key={field.name}>
              <label htmlFor={id}>{field.label} ({field.optional ? 'facultatif' : 'obligatoire'})</label>
              {field.type === 'select' ? (
                <select id={id} name={field.name} defaultValue="">
                  <option value="">Non renseigné</option>
                  <option value="woman">Femme</option>
                  <option value="man">Homme</option>
                  <option value="nonbinary">Non binaire</option>
                  <option value="other">Autre</option>
                  <option value="undisclosed">Préfère ne pas répondre</option>
                </select>
              ) : <input
                id={id}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                max={field.max}
                minLength={registering && field.name === 'password' ? 8 : undefined}
                required
                aria-invalid={errors[field.name] ? true : undefined}
                aria-describedby={errors[field.name] ? `${id}-error` : undefined}
                onChange={() => {
                  setErrors(previous => ({
                    ...previous,
                    [field.name]: undefined,
                    ...(field.name === 'password' ? { passwordConfirmation: undefined } : {}),
                  }))
                  setSubmitted(false)
                }}
              />}
              {errors[field.name] && (
                <p className="auth-error" id={`${id}-error`} role="alert">
                  {errors[field.name]}
                </p>
              )}
            </div>
          )
        })}
        <button className="api-button" type="submit">
          {registering ? 'Créer mon compte' : 'Se connecter'}
        </button>
        <p className="auth-feedback" role="status">
          {submitted && `Service ${registering ? 'd’inscription' : 'de connexion'} indisponible : aucune demande n’a été envoyée.`}
        </p>
      </form>
      <p className="auth-switch">
        {registering ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
        <a
          href={registering ? '#login' : '#register'}
          onClick={event => {
            event.preventDefault()
            onNavigate(registering ? 'login' : 'register')
          }}
        >
          {registering ? 'Se connecter' : 'Créer mon compte'}
        </a>
      </p>
      <p className="auth-notice" id={`${mode}-notice`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6m0-10v1" />
        </svg>
        <span>
          Service {registering ? 'd’inscription' : 'de connexion'} indisponible.
          Aucune donnée n’est envoyée, aucune connexion ni inscription n’est effectuée.
        </span>
      </p>
    </section>
  )
}
