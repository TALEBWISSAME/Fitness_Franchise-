export function validateRegistration(values) {
  const errors = {}
  for (const name of ['displayName', 'email', 'password', 'passwordConfirmation']) {
    if (!values[name]?.trim()) errors[name] = 'Ce champ est obligatoire.'
  }
  if (values.displayName?.trim().length > 100) errors.displayName = '100 caractères maximum.'
  if (values.email?.trim().length > 254 || !/^[^\s@]+@[^\s@]+$/.test(values.email?.trim() || '')) errors.email = 'Saisissez une adresse email valide.'
  if (values.password && (values.password.length < 12 || values.password.length > 64 || new TextEncoder().encode(values.password).length > 72)) {
    errors.password = 'Utilisez 12 à 64 caractères (72 octets UTF-8 maximum).'
  }
  if (values.passwordConfirmation !== values.password) errors.passwordConfirmation = 'Les mots de passe ne correspondent pas.'
  return errors
}
