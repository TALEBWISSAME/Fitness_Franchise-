import { useEffect, useState } from 'react'
import { getApi, writeApi } from './api.js'

import { AuthContext } from './authContext.js'
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const expire = () => { setUser(null); setError('Votre session a expirÃ©. Reconnectez-vous.') }
    window.addEventListener('session-expired', expire)
    getApi('/me', controller.signal).then(profile => { if (active) setUser(profile) })
      .catch(err => { if (active && err.status !== 401) setError('Impossible de vÃ©rifier la session.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false; controller.abort(); window.removeEventListener('session-expired', expire) }
  }, [])
  async function login(email, password) {
    setUser(null)
    await writeApi('/auth/login', { email, password }, 'POST', true)
    const profile = await getApi('/me')
    setError(''); setUser(profile)
  }
  async function logout() {
    await writeApi('/auth/logout', {})
    setUser(null); setError('')
  }
  return <AuthContext.Provider value={{ user, loading, error, login, logout }}>{children}</AuthContext.Provider>
}
