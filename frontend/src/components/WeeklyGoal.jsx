import { useEffect, useState } from 'react'
import { getApi, writeApi } from '../api.js'

export default function WeeklyGoal() {
  const [goal, setGoal] = useState(null)
  const [target, setTarget] = useState('3')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    let timer
    let initializeTarget = true
    async function load() {
      try {
        const data = await getApi('/me/weekly-goal', controller.signal)
        if (!controller.signal.aborted) {
          setGoal(data); setLoadError('')
          if (initializeTarget) { setTarget(String(data.targetSessions ?? 3)); initializeTarget = false }
        }
      } catch (err) { if (!controller.signal.aborted) setLoadError(err instanceof TypeError ? 'Impossible de charger votre objectif. Réessayez dans un instant.' : err.message) }
      finally { if (!controller.signal.aborted) { setLoading(false); timer = setTimeout(load, 5000) } }
    }
    load()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [retry])
  async function save(event) {
    event.preventDefault()
    if (busy) return
    const value = Number(target)
    if (!Number.isInteger(value) || value < 1 || value > 14) { setError('Choisissez un entier de 1 à 14.'); return }
    setBusy(true); setSaved(false)
    try { setGoal(await writeApi('/me/weekly-goal', { targetSessions: value }, 'PUT')); setError(''); setSaved(true) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <section className="card weekly-goal-card" aria-busy={busy || loading}><h2>Mon objectif de la semaine</h2>
    {loading && <p className="ui-loading" role="status"><span className="ui-spinner" aria-hidden="true" />Chargement de votre objectif…</p>}
    {loadError && <div className="ui-error" role="alert"><p>{loadError}</p><button className="button-outline" type="button" onClick={() => setRetry(previous => previous + 1)}>Réessayer</button></div>}
    {goal && <><p>Du {goal.weekStart} au {goal.weekEnd} · Europe/Paris</p>
      {goal.targetSessions === null ? <p>Aucun objectif défini pour cette semaine.</p> : <>
        <p>{goal.completedSessions} / {goal.targetSessions} séances{goal.achieved && ' · Objectif atteint'}</p>
        <progress aria-label="Progression de l’objectif" max="100" value={goal.progressPercent} />
      </>}
    </>}
    {goal && <form className="weekly-goal-form" onSubmit={save}><div className="auth-field"><label htmlFor="weekly-target">Cible : 1 à 14 séances</label>
      <input id="weekly-target" type="number" min="1" max="14" step="1" required value={target} disabled={busy} onChange={event => { setTarget(event.target.value); setSaved(false) }} /></div>
      <button className="api-button" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer la cible'}</button></form>}
    {saved && <p className="ui-success" role="status">Objectif enregistré.</p>}
    {error && <p className="ui-error" role="alert">{error}</p>}
  </section>
}
