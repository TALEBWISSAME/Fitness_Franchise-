import { useState } from 'react'
import EquipmentIcon from './EquipmentIcon.jsx'
import photos from './equipmentPhotos.json'

export default function EquipmentMedia({ machine, detailed = false }) {
  const photo = photos[machine.type]
  const [failedSource, setFailedSource] = useState('')
  const available = photo && failedSource !== photo.src
  const generated = photo?.kind === 'generated'
  return <figure className={`equipment-media${detailed ? ' equipment-media-detailed' : ''}`}>
    <div className="equipment-media-frame">
      {available ? <img src={photo.src} alt={`${machine.name || 'Équipement'} : ${generated ? 'illustration réaliste générée par IA' : 'photo illustrative du type de machine'}`} loading={detailed ? 'eager' : 'lazy'} decoding="async" onError={() => setFailedSource(photo.src)} />
        : <div className="equipment-media-unavailable"><EquipmentIcon type={machine.type} /><span>Photo à compléter</span><small>{photo ? 'Image momentanément indisponible' : 'Aucune photo adaptée validée'}</small></div>}
      {available && <span className="equipment-media-label">{generated ? 'Visuel généré par IA' : 'Photo illustrative'}</span>}
    </div>
    {available && <figcaption>
      <span>{generated ? photo.title : `${detailed ? 'Photographie : ' : ''}${photo.author}`}</span>
      {generated ? <span>Illustration du modèle</span> : <span><a href={photo.source} target="_blank" rel="noopener noreferrer">Source</a><span aria-hidden="true"> · </span><a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a></span>}
      {detailed && <small>{generated ? 'Illustration générée par IA : l’apparence peut varier selon les fabricants. Aucun équipement réel de la franchise n’est représenté.' : 'Image non retouchée · illustration d’un type de machine, sans lien avec un inventaire réel.'}</small>}
    </figcaption>}
  </figure>
}
