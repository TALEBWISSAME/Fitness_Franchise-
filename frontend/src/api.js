const API_URL = 'http://localhost:8080/api'

export async function getApi(path, signal) {
  const response = await fetch(`${API_URL}${path}`, { signal })
  if (!response.ok) {
    throw new Error(`Erreur du backend : HTTP ${response.status}`)
  }
  return response.json()
}
