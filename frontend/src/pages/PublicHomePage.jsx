import { useState } from 'react'
import gymBanner from '../assets/gym-banner.png'
import { useAuth } from '../authContext.js'
import { PublicHeader, PublicFooter } from '../components/PublicSiteChrome.jsx'
import EquipmentUniverses from '../components/equipment/EquipmentUniverses.jsx'
import EquipmentDialog from '../components/equipment/EquipmentDialog.jsx'
import './PublicHomePage.css'

function Arrow({ diagonal = false }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} /></svg>
}

function SpaceIcon({ type }) {
  const paths = {
    cardio: 'M5 17h13a3 3 0 0 1 0 6H5a3 3 0 0 1 0-6Zm11 0L20 3h4M17 9h5M7 20h9',
    strength: 'M5 9v10m4-13v16m14-13v10M19 6v16M9 14h10M2 11v6m24-6v6',
    movement: 'M6 23h18M9 23l5-10 6 4 2 6M14 13l3-6 6 4 3-3M17 7l-6 1-3 6',
  }
  return <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[type]} />{type === 'movement' && <circle cx="19" cy="3" r="2" />}</svg>
}

const demoSpaces = [
  { name: 'Ambiance cardio', image: '/images/fitness-premium/cardio.png', text: 'Un aperçu visuel dédié à l’endurance et au mouvement.', category: 'cardio' },
  { name: 'Plateau musculation', image: '/images/fitness-premium/gym-interior.png', text: 'Une ambiance imaginée autour de la force et de la progression.', category: 'upper-body' },
  { name: 'Zone fonctionnelle', image: '/images/fitness-premium/functional.png', text: 'Une inspiration pour varier les mouvements et les entraînements.', category: 'functional' },
]

export default function PublicHomePage({ onNavigate }) {
  const { user } = useAuth()
  const [selectedSpace, setSelectedSpace] = useState(null)
  const account = () => onNavigate(user ? 'profile' : 'login')
  const join = () => onNavigate(user ? 'statistics' : 'register')

  return <div className="franchise-home">
    <PublicHeader onNavigate={onNavigate} />

    <section className="fh-hero" id="accueil" aria-labelledby="fh-title">
      <img className="fh-hero-image" src={gymBanner} alt="Une sportive dans un espace d’entraînement" fetchPriority="high" />
      <div className="fh-hero-wash" />
      <div className="fh-hero-content">
        <p className="fh-eyebrow">FITNESS FRANCHISE</p>
        <h1 id="fh-title">Votre énergie.<br /><em>Votre progression.</em></h1>
        <p className="fh-hero-lead">Entraînez-vous. Retrouvez vos séances.<br />Donnez une nouvelle dimension à votre progression.</p>
        <p className="fh-hero-description">Votre franchise, vos équipements et votre suivi sportif réunis dans une même expérience.</p>
        <div className="fh-actions">
          <a className="fh-primary" href="#nos-espaces">Découvrir nos espaces <Arrow /></a>
          <button className="fh-secondary" type="button" onClick={join}>{user ? 'Voir ma progression' : 'Créer mon compte'} <Arrow diagonal /></button>
        </div>
        <div className="fh-hero-features" aria-label="Fonctionnalités de votre espace personnel">
          <div><SpaceIcon type="strength" /><span><strong>Vos séances</strong><small>Un historique personnel</small></span></div>
          <div><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 24h23M7 20v-5m6 5V9m6 11v-8m6 8V4" /></svg><span><strong>Vos statistiques</strong><small>Une progression visible</small></span></div>
          <div><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="15" cy="15" r="10" /><circle cx="15" cy="15" r="5" /><path d="m15 15 11-11m-6 0h6v6" /></svg><span><strong>Votre objectif</strong><small>Un cap chaque semaine</small></span></div>
        </div>
      </div>
      <div className="fh-hero-caption"><span>LE MOUVEMENT.</span><span>À VOTRE RYTHME.</span></div>
    </section>

    <section className="fh-concept fh-section" id="notre-concept" aria-labelledby="fh-concept-title">
      <div><p className="fh-eyebrow">NOTRE CONCEPT</p><h2 id="fh-concept-title">Une franchise.<br /><em>Votre parcours.</em></h2></div>
      <div className="fh-concept-copy"><p className="fh-intro">Un même espace pour découvrir l’univers de la franchise et suivre vos entraînements.</p><p>Fitness Franchise relie la découverte des équipements à votre suivi personnel : consultez vos séances enregistrées, filtrez votre historique, visualisez vos statistiques et fixez votre objectif hebdomadaire.</p><a className="fh-text-link" href="#votre-progression">Découvrir le suivi personnel <Arrow /></a></div>
    </section>

    <section className="fh-section premium-universes-section" id="nos-equipements" aria-labelledby="fh-universes-title">
      <div className="fh-section-heading"><div><p className="fh-eyebrow">NOS UNIVERS</p><h2 id="fh-universes-title">4 univers d’entraînement</h2><p className="premium-section-description">20 modèles de référence pour explorer les équipements du projet.</p></div><button className="fh-text-link" type="button" onClick={() => onNavigate('equipment')}>Tout le catalogue <Arrow diagonal /></button></div>
      <EquipmentUniverses onDiscover={category => onNavigate('equipment', category)} />
      <p className="premium-image-note">Visuels d’illustration générés. Les modèles présentés ne constituent pas un inventaire réel.</p>
    </section>

    <section className="fh-section premium-spaces-section" id="nos-espaces" aria-labelledby="fh-spaces-title">
      <div className="fh-section-heading"><div><p className="fh-eyebrow">NOS ESPACES</p><h2 id="fh-spaces-title">L’esprit de la salle.<br /><em>L’énergie du collectif.</em></h2><p className="premium-section-description">Découvrez les ambiances imaginées pour Fitness Franchise.</p></div><span className="premium-demo-label">Présentation de démonstration</span></div>
      <p className="premium-spaces-notice">La liste officielle des salles n’est pas encore définie. Ces cartes illustrent le design et ne représentent aucun établissement réel.</p>
      <div className="premium-spaces-grid">{demoSpaces.map(space => <article className="premium-space-card" key={space.name}>
        <div className="premium-space-photo"><img src={space.image} alt="" loading="lazy" width="1536" height="1024" /><span className="premium-demo-label">Démonstration</span></div>
        <div className="premium-space-content"><h3>{space.name}</h3><p>{space.text}</p><button className="fh-primary" type="button" onClick={() => setSelectedSpace(space)} aria-label={`Consulter les informations : ${space.name}`}>Consulter les informations <Arrow /></button></div>
      </article>)}</div>
      <p className="premium-image-note">Images générées à titre illustratif. Aucune adresse, capacité ou disponibilité réelle.</p>
    </section>
    {selectedSpace && <EquipmentDialog title={selectedSpace.name} variant="space" onClose={() => setSelectedSpace(null)}>
      <figure className="premium-space-detail-hero"><img className="premium-space-detail-photo" src={selectedSpace.image} alt="Ambiance illustrative d’entraînement" /><figcaption><span className="premium-demo-label">Démonstration</span><span>Visuel d’ambiance généré</span></figcaption></figure>
      <div className="premium-space-detail-copy"><p className="equipment-demo-notice">Espace de démonstration · aucune salle réelle associée.</p>
      <p className="premium-space-detail-lead">{selectedSpace.text}</p><p>Les adresses, horaires et équipements par salle seront consultables lorsque la liste officielle sera définie.</p></div>
      <button className="fh-primary" type="button" onClick={() => { const category = selectedSpace.category; setSelectedSpace(null); onNavigate('equipment', category) }}>Explorer les modèles du projet <Arrow /></button>
    </EquipmentDialog>}

    <section className="fh-progress-section" id="votre-progression" aria-labelledby="fh-progress-title">
      <div className="fh-progress-inner"><div className="fh-progress-copy"><p className="fh-eyebrow">03 / VOTRE ESPACE PERSONNEL</p><h2 id="fh-progress-title">L’entraînement se vit.<br /><em>La progression se suit.</em></h2><p>Vos séances ne s’arrêtent pas à la sortie de la salle. Retrouvez votre historique, comprenez votre rythme et fixez votre objectif pour la semaine.</p><button className="fh-primary" type="button" onClick={account}>{user ? 'Retrouver mon espace' : 'Me connecter'} <Arrow /></button></div>
        <div className="fh-follow-card"><p className="fh-follow-label">UNE VUE D’ENSEMBLE, EN UN ENDROIT</p>
          <div className="fh-follow-item"><span>01</span><div><h3>Vos séances</h3><p>Un historique personnel, clair et filtrable.</p></div><Arrow diagonal /></div>
          <div className="fh-follow-item"><span>02</span><div><h3>Votre rythme</h3><p>Des statistiques pour comprendre votre activité.</p></div><Arrow diagonal /></div>
          <div className="fh-follow-item"><span>03</span><div><h3>Votre cap</h3><p>Un objectif hebdomadaire et sa progression.</p></div><Arrow diagonal /></div>
        </div>
      </div>
    </section>

    <section className="fh-invitation fh-section"><p className="fh-eyebrow">LE PREMIER PAS VOUS APPARTIENT</p><h2>On commence <em>ensemble ?</em></h2><p>Créez votre espace et donnez une place à chaque entraînement.</p><button className="fh-primary" type="button" onClick={join}>{user ? 'Consulter mes statistiques' : 'Créer mon espace personnel'} <Arrow /></button></section>
    <PublicFooter onNavigate={onNavigate} />
  </div>
}
