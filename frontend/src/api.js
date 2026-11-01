const API_URL = 'http://localhost:8080/api'

export async function requestApi(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include' })
  if (!response.ok) {
    const error = new Error(response.status === 401 ? (path === '/auth/login' ? 'Email ou mot de passe incorrect.'
      : path === '/auth/register' ? 'Inscription refusée. Actualisez la page et réessayez.'
        : 'Votre session a expiré. Reconnectez-vous.')
      : response.status === 409 ? 'Cette adresse email est déjà utilisée.'
        : response.status === 403 ? 'Votre demande n’a pas pu être validée. Actualisez la page et réessayez.'
          : response.status === 400 ? 'Vérifiez les informations saisies et les dates sélectionnées.'
            : response.status >= 500 ? 'Le service est momentanément indisponible. Réessayez dans un instant.'
        : `La demande a échoué (HTTP ${response.status}).`)
    error.status = response.status
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/register' && path !== '/auth/csrf' && path !== '/me') {
      window.dispatchEvent(new Event('session-expired'))
    }
    throw error
  }
  return response.status === 204 ? null : response.json()
}
export function getApi(path, signal) { return requestApi(path, { signal }) }
export async function writeApi(path, body, method = 'POST', form = false) {
  const csrf = await getApi('/auth/csrf')
  return requestApi(path, { method, headers: {
    'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json',
    [csrf.headerName]: csrf.token,
  }, body: form ? new URLSearchParams(body).toString() : JSON.stringify(body) })
}
