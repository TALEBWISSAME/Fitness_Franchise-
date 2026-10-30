import { useId, useRef } from 'react'
import useDialogFocus from '../../hooks/useDialogFocus.js'

export default function EquipmentDialog({ title, onClose, children, variant = '' }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, onClose)
  return (
    <div className="modal-overlay equipment-dialog-overlay">
      <section className={`activity-modal equipment-dialog${variant ? ` equipment-dialog-${variant}` : ''}`} ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-header"><h2 id={titleId}>{title}</h2><button className="modal-close" type="button" onClick={onClose} aria-label="Fermer la fenêtre">×</button></header>
        {children}
      </section>
    </div>
  )
}
