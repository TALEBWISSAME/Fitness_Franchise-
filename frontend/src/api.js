const API_URL = 'http://localhost:8080/api'

export async function requestApi(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include' })
  if (!response.ok) {
    const error = new Error(response.status === 401 ? 'Session expirée ou identifiants incorrects.'
      : response.status === 409 ? 'Cette adresse email est déjà utilisée.'
        : `La demande a échoué (HTTP ${response.status}).`)
    error.status = response.status
    if (response.status === 401 && path !== '/auth/login' && path !== '/me') window.dispatchEvent(new Event('session-expired'))
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
