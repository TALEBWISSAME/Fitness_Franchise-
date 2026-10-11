import { useEffect, useState } from 'react'
import { getApi } from '../api.js'

export default function useActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    let timer

    async function load() {
      try {
        const data = await getApi('/activities', controller.signal)
        if (!Array.isArray(data)) throw new Error('Réponse des activités invalide')
        if (!controller.signal.aborted) {
          setActivities(data)
          setError('')
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof TypeError
            ? 'Connexion au backend impossible. Vérifie que Spring Boot fonctionne sur le port 8080.'
            : err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          timer = setTimeout(load, 5000)
        }
      }
    }

    load()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [])

  return { activities, loading, error }
}
