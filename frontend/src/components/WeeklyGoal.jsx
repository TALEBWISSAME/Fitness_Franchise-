import { useEffect, useState } from 'react'
import { getApi, writeApi } from '../api.js'

export default function WeeklyGoal() {
  const [goal, setGoal] = useState(null)
  const [target, setTarget] = useState('3')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    let timer
    async function load() {
      try {
        const data = await getApi('/me/weekly-goal', controller.signal)
        if (!controller.signal.aborted) { setGoal(data); setError('') }
      } catch (err) { if (!controller.signal.aborted) setError(err.message) }
      finally { if (!controller.signal.aborted) timer = setTimeout(load, 5000) }
    }
    load()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [])
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
  return <section className="card" aria-busy={busy}><h2>Mon objectif de la semaine</h2>
    {goal && <><p>Du {goal.weekStart} au {goal.weekEnd} · Europe/Paris</p>
      {goal.targetSessions === null ? <p>Aucun objectif défini pour cette semaine.</p> : <>
        <p>{goal.completedSessions} / {goal.targetSessions} séances{goal.achieved && ' · Objectif atteint'}</p>
        <progress aria-label="Progression de l’objectif" max="100" value={goal.progressPercent} />
      </>}
    </>}
    <form onSubmit={save}><div className="auth-field"><label htmlFor="weekly-target">Cible : 1 à 14 séances</label>
      <input id="weekly-target" type="number" min="1" max="14" step="1" required value={target} disabled={busy} onChange={event => { setTarget(event.target.value); setSaved(false) }} /></div>
      <button className="api-button" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer la cible'}</button></form>
    {saved && <p role="status">Objectif enregistré.</p>}
    {error && <p role="alert">{error}</p>}
  </section>
}
