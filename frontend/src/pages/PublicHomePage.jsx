import { useState } from 'react'
import { useAuth } from '../authContext.js'
import { PublicHeader } from '../components/PublicSiteChrome.jsx'
import BrandMark from '../components/BrandMark.jsx'
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

const demoCoaches = [
  { name: 'Samir Benaïssa', specialty: 'Musculation', image: 'coach-samir' },
  { name: 'Léa Martin', specialty: 'Cardio', image: 'coach-lea' },
  { name: 'Lucas Bernard', specialty: 'Entraînement fonctionnel', image: 'coach-lucas' },
  { name: 'Élise Moreau', specialty: 'Mobilité et souplesse', image: 'coach-elise' },
]
const demoTestimonials = [
  { name: 'Nora', image: 'review-nora', text: 'Retrouver mes séances au même endroit et voir ma progression : c’est ce qui me donnerait envie de garder le rythme.' },
  { name: 'Adam', image: 'review-adam', text: 'Explorer les équipements avant de choisir mon entraînement m’aiderait à mieux préparer ma prochaine séance.' },
  { name: 'Inès', image: 'review-ines', text: 'Un objectif pour la semaine, un historique clair : des repères simples pour avancer à mon rythme.' },
]
const advantages = [
  { title: 'Des équipements à explorer', text: '20 modèles de référence, répartis dans 4 univers d’entraînement.', icon: 'strength' },
  { title: 'Un suivi personnel', text: 'Retrouvez vos séances enregistrées et visualisez votre progression.', icon: 'cardio' },
  { title: 'Un objectif à votre rythme', text: 'Fixez votre cap hebdomadaire et suivez vos efforts.', icon: 'movement' },
  { title: 'Une expérience réunie', text: 'Le catalogue et votre espace sportif, dans une même application.', icon: 'strength' },
]

export default function PublicHomePage({ onNavigate }) {
  const { user } = useAuth()
  const [selectedSpace, setSelectedSpace] = useState(null)
  const account = () => onNavigate(user ? 'profile' : 'login')
  const join = () => onNavigate(user ? 'statistics' : 'register')

  return <div className="franchise-home home-editorial">
    <PublicHeader onNavigate={onNavigate} />

    <section className="fh-hero" id="accueil" aria-labelledby="fh-title">
      <img className="fh-hero-image" src="/images/home-premium/hero.png" alt="Illustration d’une sportive s’entraînant avec des cordes dans une salle sombre" fetchPriority="high" />
      <div className="fh-hero-wash" />
      <div className="fh-hero-content">
        <p className="fh-eyebrow">PLUS QU’UNE SÉANCE, UNE EXPÉRIENCE</p>
        <h1 id="fh-title">L’énergie d’aujourd’hui,<br />une meilleure version<br /><em>de vous demain.</em></h1>
        <p className="fh-hero-lead">Explorez les équipements, retrouvez vos entraînements et construisez votre progression, à votre rythme.</p>
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

    <section className="fh-section premium-universes-section" id="nos-equipements" aria-labelledby="fh-universes-title">
      <div className="fh-section-heading"><div><p className="fh-eyebrow">NOS UNIVERS D’ENTRAÎNEMENT</p><h2 id="fh-universes-title">4 univers pour atteindre <em>vos objectifs</em></h2><p className="premium-section-description">Explorez les équipements et trouvez le mouvement qui vous correspond.</p></div><button className="fh-text-link" type="button" onClick={() => onNavigate('equipment')}>Voir tout le catalogue <Arrow diagonal /></button></div>
      <EquipmentUniverses onDiscover={category => onNavigate('equipment', category)} />
      <p className="premium-image-note">Visuels d’illustration générés. Les modèles présentés ne constituent pas un inventaire réel.</p>
    </section>

    <section className="home-advantages" id="notre-concept" aria-labelledby="fh-concept-title">
      <div className="home-advantages-photo"><img src="/images/fitness-premium/gym-interior.png" alt="Ambiance illustrative d’une salle de musculation éclairée en orange" loading="lazy" width="1536" height="1024" /><span>Ambiance illustrative · image générée</span></div>
      <div className="home-advantages-copy"><p className="fh-eyebrow">POURQUOI CHOISIR FITNESS FRANCHISE ?</p><h2 id="fh-concept-title">Un même espace.<br />De multiples <em>possibilités.</em></h2>
        <div className="home-advantages-grid">{advantages.map(item => <article key={item.title}><span className="home-circle-icon"><SpaceIcon type={item.icon} /></span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
        <a className="fh-text-link" href="#votre-progression">Découvrir le suivi personnel <Arrow /></a>
      </div>
    </section>

    <section className="fh-section home-coaches-section" id="nos-coachs" aria-labelledby="home-coaches-title">
      <div className="home-coaches-intro"><p className="fh-eyebrow">NOTRE ÉQUIPE · DÉMONSTRATION</p><h2 id="home-coaches-title">Des coachs<br /><em>à vos côtés.</em></h2><p>Une présentation illustrative de l’accompagnement sportif imaginé pour la franchise.</p><a className="fh-text-link" href="#home-coaches-note">À propos de cette équipe <Arrow /></a></div>
      <div className="home-coaches-grid">{demoCoaches.map(coach => <article className="home-coach" key={coach.name}>
        <img src={`/images/home-premium/${coach.image}.png`} alt={`Portrait généré du personnage fictif ${coach.name}`} loading="lazy" width="1024" height="1536" />
        <div><h3>{coach.name}</h3><p>{coach.specialty}</p><span>Coach fictif · démonstration</span></div>
      </article>)}</div>
      <p className="home-demo-note" id="home-coaches-note">Équipe fictive : noms, portraits générés et spécialités servent uniquement à illustrer le design. Aucun coach réel ni service de coaching réservable n’est présenté.</p>
    </section>

    <section className="fh-section home-testimonials-section" id="temoignages" aria-labelledby="home-testimonials-title">
      <div className="fh-section-heading"><div><p className="fh-eyebrow">ILS NOUS FONT CONFIANCE · DÉMONSTRATION</p><h2 id="home-testimonials-title">Des parcours, une même <em>envie.</em></h2></div><a className="fh-text-link" href="#home-testimonials-note">À propos de ces exemples <Arrow /></a></div>
      <div className="home-testimonials-grid">{demoTestimonials.map(item => <figure className="home-testimonial" key={item.name}>
        <img src={`/images/home-premium/${item.image}.png`} alt={`Portrait généré du personnage fictif ${item.name}`} loading="lazy" width="1024" height="1024" />
        <div><blockquote>« {item.text} »</blockquote><figcaption>{item.name} <span>Personnage fictif</span></figcaption><span className="home-demo-tag">Exemple fictif · démonstration</span></div>
      </figure>)}</div>
      <p className="home-demo-note" id="home-testimonials-note">Textes scénarisés et portraits générés pour la démonstration. Il ne s’agit pas d’avis recueillis auprès d’adhérents réels.</p>
    </section>

    <section className="fh-section premium-spaces-section" id="nos-espaces" aria-labelledby="fh-spaces-title">
      <div className="fh-section-heading"><div><p className="fh-eyebrow">NOS ESPACES</p><h2 id="fh-spaces-title">L’esprit de la salle.<br /> <em>L’énergie du collectif.</em></h2><p className="premium-section-description">Découvrez les ambiances imaginées pour Fitness Franchise.</p></div><span className="premium-demo-label">Présentation de démonstration</span></div>
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

    <section className="fh-progress-section home-progress-premium" id="votre-progression" aria-labelledby="fh-progress-title">
      <div className="home-progress-container">
        <div className="home-progress-intro"><div className="home-progress-copy"><p className="fh-eyebrow">VOTRE ESPACE PERSONNEL</p><h2 id="fh-progress-title">L’entraînement se vit.<br /><em>La progression se suit.</em></h2><p>Chaque séance compte. Retrouvez vos entraînements, comprenez votre rythme et gardez votre prochain objectif en vue.</p><div className="fh-actions"><button className="fh-primary" type="button" onClick={account}>{user ? 'Retrouver mon espace' : 'Me connecter'} <Arrow /></button>{!user && <button className="fh-secondary" type="button" onClick={join}>Créer mon compte <Arrow diagonal /></button>}</div></div>
          <figure className="home-progress-photo"><img src="/images/fitness-premium/upper-body.png" alt="Illustration d’un sportif effectuant un tirage dans une salle de musculation" loading="lazy" width="1536" height="1024" /><figcaption><span>VOTRE ÉNERGIE. VOTRE RYTHME.</span><strong>Chaque séance<br />est un pas en avant.</strong><small>Visuel d’ambiance généré</small></figcaption></figure>
        </div>
        <div className="home-progress-cards">
          <article><div className="home-progress-card-top"><span className="home-progress-icon"><SpaceIcon type="strength" /></span><span>01</span></div><h3>Vos séances</h3><p>Un historique personnel, clair et filtrable, pour retrouver chaque entraînement enregistré.</p><span className="home-progress-card-tag">RETROUVER SES EFFORTS</span></article>
          <article><div className="home-progress-card-top"><span className="home-progress-icon"><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 25h23M8 20v-6m7 6V9m7 11V4" /></svg></span><span>02</span></div><h3>Vos statistiques</h3><p>Une vue d’ensemble de votre activité pour comprendre votre régularité et votre progression.</p><span className="home-progress-card-tag">VISUALISER SON PARCOURS</span></article>
          <article><div className="home-progress-card-top"><span className="home-progress-icon"><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="15" cy="15" r="10" /><circle cx="15" cy="15" r="5" /><path d="m15 15 11-11m-6 0h6v6" /></svg></span><span>03</span></div><h3>Vos objectifs hebdomadaires</h3><p>Un cap pour la semaine et des repères pour suivre vos efforts, à votre rythme.</p><span className="home-progress-card-tag">GARDER LE CAP</span></article>
        </div>
      </div>
    </section>

    <section className="home-facts home-facts-premium" aria-labelledby="home-facts-title">
      <header className="home-facts-heading"><p className="fh-eyebrow">FITNESS FRANCHISE EN UN REGARD</p><h2 id="home-facts-title">Des repères clairs.<br /><em>Votre progression au centre.</em></h2></header>
      <div className="home-facts-grid">
        <article className="home-fact home-fact-number"><div className="home-fact-visual"><strong>20</strong><span>MODÈLES</span></div><h3>Modèles de référence</h3><p>Des équipements à découvrir dans notre catalogue.</p></article>
        <article className="home-fact home-fact-number"><div className="home-fact-visual"><strong>4</strong><span>UNIVERS</span></div><h3>Univers d’entraînement</h3><p>Cardio, haut du corps, bas du corps et fonctionnel.</p></article>
        <article className="home-fact"><div className="home-fact-visual"><span className="home-fact-icon"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5H5v24h22V5h-4M12 3h8v5h-8zM10 15h12M10 21h8" /></svg></span></div><h3>Historique personnel</h3><p>Vos séances enregistrées, réunies dans votre espace.</p></article>
        <article className="home-fact"><div className="home-fact-visual"><span className="home-fact-icon"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="16" cy="16" r="11" /><circle cx="16" cy="16" r="6" /><path d="m16 16 12-12m-6 0h6v6" /></svg></span></div><h3>Objectifs hebdomadaires</h3><p>Un cap chaque semaine pour avancer à votre rythme.</p></article>
      </div>
    </section>
    <section className="home-final-cta home-final-premium" aria-labelledby="home-final-title"><img src="/images/home-premium/invitation.png" alt="Illustration d’un sportif s’entraînant avec un haltère" loading="lazy" width="1536" height="1024" /><div className="home-final-premium-content"><p className="fh-eyebrow">VOTRE PROCHAIN CHAPITRE COMMENCE ICI</p><h2 id="home-final-title">Prêt à commencer<br /><em>votre parcours ?</em></h2><p>Donnez une place à chaque séance. Créez votre espace et avancez vers vos objectifs, un entraînement à la fois.</p><div className="fh-actions"><button className="fh-primary" type="button" onClick={join}>{user ? 'Consulter mes statistiques' : 'Créer mon compte'} <Arrow /></button><a className="fh-secondary" href="#nos-espaces">Explorer nos espaces <Arrow diagonal /></a></div><span className="home-final-signature">L’ÉNERGIE D’AVANCER. LE PLAISIR DE PROGRESSER.</span></div></section>
    <footer className="fh-footer home-footer">
      <div className="fh-footer-identity"><a href="#accueil" aria-label="Fitness Franchise - Retour à l’accueil"><BrandMark /></a><p>L’énergie d’avancer.<br />Le plaisir de progresser.</p></div>
      <div className="fh-footer-column"><h3>Navigation</h3><a href="#accueil">Accueil</a><a href="#nos-espaces">Nos espaces</a><button type="button" onClick={() => onNavigate('equipment')}>Équipements</button><a href="#notre-concept">À propos</a></div>
      <div className="fh-footer-column"><h3>Mon compte</h3><button type="button" onClick={join}>{user ? 'Ma progression' : 'Créer mon compte'}</button><button type="button" onClick={account}>{user ? 'Mon espace' : 'Se connecter'}</button><button type="button" onClick={account}>Mon profil</button><button type="button" onClick={() => onNavigate(user ? 'activities' : 'login')}>Mes séances</button><button type="button" onClick={() => onNavigate(user ? 'statistics' : 'login')}>Mes statistiques</button></div>
      <div className="fh-footer-column"><h3>Fitness Franchise</h3><a href="#votre-progression">Le suivi sportif</a><a href="#nos-coachs">Nos coachs · démo</a><a href="#temoignages">Témoignages · démo</a><a href="#nos-equipements">Les 4 univers</a></div>
      <div className="fh-footer-column"><h3>Le projet</h3><p>Projet universitaire<br />M1 Informatique</p><p>Photos d’ambiance et portraits générés. Équipe, espaces et témoignages de démonstration.</p></div>
      <p className="fh-footer-copyright">© 2026 Fitness Franchise · Projet universitaire · Présentation illustrative</p>
    </footer>
  </div>
}
