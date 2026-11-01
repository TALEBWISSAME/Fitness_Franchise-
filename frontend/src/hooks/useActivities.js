import { useEffect, useState } from 'react'
import { getApi } from '../api.js'
import { useAuth } from '../authContext.js'

export default function useActivities() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    let timer
    const refresh = () => setRefreshKey(previous => previous + 1)
    window.addEventListener('activities-updated', refresh)

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
            ? 'Vos séances sont momentanément indisponibles. Une nouvelle tentative sera effectuée automatiquement.'
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
      window.removeEventListener('activities-updated', refresh)
    }
  }, [user, refreshKey])

  return user ? { activities, loading, error } : { activities: [], loading: false, error: 'Connectez-vous pour consulter vos activités.' }
}
