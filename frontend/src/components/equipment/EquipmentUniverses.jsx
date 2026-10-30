import EquipmentIcon from './EquipmentIcon.jsx'
import { SiteArrow } from '../PublicSiteChrome.jsx'
import { equipmentUniverses } from './equipmentUniverses.js'

export default function EquipmentUniverses({ onDiscover, selected = '' }) {
  return <div className="premium-universes">{equipmentUniverses.map((universe, index) => <article className="premium-universe" data-selected={selected === universe.id} key={universe.id}>
    <div className="premium-universe-photo"><img src={universe.image} alt="" loading="lazy" width="1536" height="1024" /><span className="premium-universe-number">0{index + 1}</span></div>
    <div className="premium-universe-content"><span className="premium-universe-icon"><EquipmentIcon type={universe.icon} /></span><h3>{universe.name}</h3><p>{universe.description}</p><button type="button" onClick={() => onDiscover(universe.id)} aria-label={`Découvrir : ${universe.name}`}>Découvrir <SiteArrow /></button></div>
  </article>)}</div>
}
