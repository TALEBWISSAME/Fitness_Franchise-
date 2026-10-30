// Validation locale de la proposition d’inscription, sans stockage ni appel API.
export function validateRegistration(values, today) {
  const errors = {}
  const required = {
    displayName: 'Nom d’affichage',
    email: 'Adresse email',
    birthDate: 'Date de naissance',
    password: 'Mot de passe',
    passwordConfirmation: 'Confirmer le mot de passe',
  }

  for (const [name, label] of Object.entries(required)) {
    if (!values[name]?.trim()) errors[name] = `${label} : ce champ est obligatoire.`
  }

  if (!errors.email && !/^[^\s@]+@[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Saisissez une adresse email valide.'
  }
  if (!errors.birthDate) {
    const value = values.birthDate
    const date = new Date(`${value}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000') ||
        !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      errors.birthDate = 'Saisissez une date de naissance valide.'
    } else if (value > today) {
      errors.birthDate = 'La date de naissance ne peut pas être dans le futur.'
    }
  }
  if (!errors.password && values.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
  }
  if (!errors.passwordConfirmation && values.passwordConfirmation !== values.password) {
    errors.passwordConfirmation = 'Les mots de passe ne correspondent pas.'
  }
  return errors
}
