import { useEffect, useRef } from 'react'
import EquipmentIcon from './EquipmentIcon.jsx'
import { equipmentStatusLabel, equipmentTypeLabel } from './equipmentPresentation.js'

export default function EquipmentCard({ machine, demonstration, onDetails, onReserve }) {
  const lightFrame = useRef(null)
  useEffect(() => () => cancelAnimationFrame(lightFrame.current), [])

  function moveLight(event) {
    if (event.pointerType !== 'mouse' || navigator.maxTouchPoints > 0 || !window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    cancelAnimationFrame(lightFrame.current)
    lightFrame.current = requestAnimationFrame(() => {
      card.style.setProperty('--equipment-light-x', `${x}px`)
      card.style.setProperty('--equipment-light-y', `${y}px`)
      card.dataset.illuminated = 'true'
    })
  }

  function leaveLight(event) {
    cancelAnimationFrame(lightFrame.current)
    event.currentTarget.removeAttribute('data-illuminated')
  }

  return (
    <article className="equipment-card" onPointerMove={moveLight} onPointerLeave={leaveLight}>
      <div className="equipment-card-top">
        <span className="equipment-machine-icon"><EquipmentIcon type={machine.type} /></span>
        <div className="equipment-card-title">
          {machine.type && <p className="equipment-type">{equipmentTypeLabel(machine.type)}</p>}
          <h2>{machine.name || 'Équipement sans nom'}</h2>
        </div>
      </div>
      <div className="equipment-card-summary">
      <div className="equipment-card-meta">
        {machine.location && <span className="equipment-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></svg>{machine.location}</span>}
        {machine.id != null && <span className="equipment-reference">Réf. {machine.id}</span>}
      </div>
      {machine.status && <span className="equipment-status" data-status={machine.status}>{equipmentStatusLabel(machine.status)}{demonstration ? ' · démo' : ''}</span>}
      </div>
      <div className="equipment-card-actions">
        <button className="button-outline" type="button" onClick={() => onDetails(machine)} aria-label={`Voir les détails : ${machine.name || 'équipement'}`}>Voir les détails</button>
        {machine.status === 'available' && <button className="button-primary" type="button" disabled={!onReserve} onClick={() => onReserve?.(machine)} title={!onReserve ? 'Service de réservation non disponible' : undefined}>Réserver</button>}
      </div>
    </article>
  )
}
