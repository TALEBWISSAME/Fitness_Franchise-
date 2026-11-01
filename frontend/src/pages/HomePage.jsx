import { useEffect, useRef, useState } from 'react'
import gymBanner from '../assets/gym-banner.png'
import ApiTestModal from '../components/ApiTestModal.jsx'
import useActivities from '../hooks/useActivities.js'
import { formatActivityDate } from '../utils/activityFilters.js'
import './HomePage.css'

const homeLinks = [
  { page: 'activities', title: 'Mon espace fitness', eyebrow: 'Le suivi sportif', description: 'Chaque séance a sa place. Retrouvez les activités reçues, dans votre espace personnel.', action: 'Explorer les activités', icon: 'M5 20v-5m5 5V11m5 9V7m5 13V3' },
  { page: 'equipment', title: 'Équipements', eyebrow: 'Le terrain de votre énergie', description: 'Explorez l’espace machines et réservation, en cours d’intégration.', action: 'Découvrir les machines', icon: 'M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9' },
  { page: 'statistics', title: 'Mes statistiques', eyebrow: 'Une autre perspective', description: 'Prenez du recul sur votre rythme d’entraînement.', action: 'Explorer ma progression', icon: 'M4 19h16M5 14l5-5 4 3 5-7' },
]

function HomeIcon({ path }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={path} /></svg>
}

function HomePage({ onNavigate }) {
  const [showApiModal, setShowApiModal] = useState(false)
  const heroRef = useRef(null)
  const dashboardRef = useRef(null)
  const lightFrame = useRef(null)
  const interactiveLight = useRef(false)

  useEffect(() => {
    const sections = [...dashboardRef.current.querySelectorAll('[data-home-reveal]')]
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!window.IntersectionObserver || motion.matches) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.dataset.homeReveal = 'visible'
        observer.unobserve(entry.target)
      })
    }, { threshold: .08, rootMargin: '0px 0px -12px 0px' })
    sections.forEach(section => {
      section.dataset.homeReveal = 'pending'
      observer.observe(section)
    })
    function revealAll() {
      if (!motion.matches) return
      sections.forEach(section => { section.dataset.homeReveal = 'visible' })
      observer.disconnect()
    }
    function revealFocused(event) {
      const section = event.target.closest('[data-home-reveal]')
      if (section) {
        section.dataset.homeReveal = 'visible'
        observer.unobserve(section)
      }
    }
    const dashboard = dashboardRef.current
    dashboard.addEventListener('focusin', revealFocused)
    motion.addEventListener('change', revealAll)
    return () => {
      observer.disconnect()
      dashboard.removeEventListener('focusin', revealFocused)
      motion.removeEventListener('change', revealAll)
    }
  }, [])

  useEffect(() => {
    const pointer = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    function updateLightPreference() {
      interactiveLight.current = pointer.matches && !motion.matches && navigator.maxTouchPoints === 0
      if (!interactiveLight.current) {
        cancelAnimationFrame(lightFrame.current)
        heroRef.current?.removeAttribute('data-illuminated')
        heroRef.current?.style.removeProperty('--hero-shift-x')
        heroRef.current?.style.removeProperty('--hero-shift-y')
      }
    }
    updateLightPreference()
    pointer.addEventListener('change', updateLightPreference)
    motion.addEventListener('change', updateLightPreference)
    return () => {
      cancelAnimationFrame(lightFrame.current)
      pointer.removeEventListener('change', updateLightPreference)
      motion.removeEventListener('change', updateLightPreference)
    }
  }, [])

  function moveHeroLight(event) {
    if (!interactiveLight.current || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width * 100
    const y = (event.clientY - bounds.top) / bounds.height * 100
    cancelAnimationFrame(lightFrame.current)
    lightFrame.current = requestAnimationFrame(() => {
      const hero = heroRef.current
      if (!hero) return
      hero.style.setProperty('--hero-light-x', `${x}%`)
      hero.style.setProperty('--hero-light-y', `${y}%`)
      hero.style.setProperty('--hero-shift-x', `${(x / 100 - .5) * -8}px`)
      hero.style.setProperty('--hero-shift-y', `${(y / 100 - .5) * -6}px`)
      hero.dataset.illuminated = 'true'
    })
  }

  function leaveHeroLight() {
    cancelAnimationFrame(lightFrame.current)
    heroRef.current?.removeAttribute('data-illuminated')
    heroRef.current?.style.removeProperty('--hero-shift-x')
    heroRef.current?.style.removeProperty('--hero-shift-y')
  }
  const { activities, loading, error } = useActivities()
  const latestActivity = activities[0]
  return (
    <div className="home-dashboard" ref={dashboardRef}>
      <section className="home-hero" aria-labelledby="welcome-title" ref={heroRef} onPointerMove={moveHeroLight} onPointerLeave={leaveHeroLight}>
        <div className="home-hero-media" aria-hidden="true">
          <img className="home-hero-photo" src={gymBanner} alt="" fetchPriority="high" decoding="async" />
        </div>
        <div className="home-hero-light" aria-hidden="true" />
        <div className="home-hero-content">
          <p className="home-eyebrow"><span aria-hidden="true" />Bienvenue chez Fitness Franchise</p>
          <h1 id="welcome-title">Votre élan.<br /><span>Sans limite.</span></h1>
          <p>Le mouvement commence ici. Retrouvez vos séances, explorez nos équipements et donnez du sens à votre entraînement.</p>
          <div className="home-hero-actions">
            <button className="button-primary" type="button" onClick={() => onNavigate('activities')} aria-describedby="home-data-scope">Voir les activités<HomeIcon path="M4 12h16m-5-5 5 5-5 5" /></button>
            <button className="button-secondary" type="button" onClick={() => onNavigate('equipment')}>Explorer les équipements<HomeIcon path="m7 17 10-10M7 7h10v10" /></button>
          </div>
        </div>
        <div className="home-hero-signature" aria-hidden="true"><span>LE GOÛT DE L’EFFORT.</span><span>L’envie d’aller plus loin.</span></div>
      </section>

      <section className="home-quick-access" aria-labelledby="home-quick-title" data-home-reveal="visible">
        <div className="home-section-heading"><h2 id="home-quick-title">À vous de jouer.</h2><span>Trois façons de vivre votre fitness</span></div>
        <div className="home-shortcuts">
          {homeLinks.map((link, index) => (
            <article className={`home-shortcut home-shortcut-${link.page}`} key={link.page}>
              <div className="home-shortcut-art" aria-hidden="true">
                {link.page === 'activities' ? (
                  <svg className="home-motion-art" viewBox="0 0 240 240" fill="none"><circle cx="120" cy="120" r="96" /><circle cx="120" cy="120" r="70" /><circle cx="120" cy="120" r="42" /><path d="M24 120a96 96 0 0 1 96-96m0 166a70 70 0 0 0 70-70M78 120a42 42 0 0 1 42-42" /><path d="m103 136 34-34m-27 0h27v27" /></svg>
                ) : <HomeIcon path={link.icon} />}
              </div>
              <span className="home-shortcut-icon"><HomeIcon path={link.icon} /></span>
              <span className="home-shortcut-index" aria-hidden="true">0{index + 1}</span>
              <p className="home-shortcut-eyebrow">{link.eyebrow}</p>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
              <button className="home-shortcut-action" type="button" onClick={() => onNavigate(link.page)}>{link.action}<HomeIcon path="M4 12h16m-5-5 5 5-5 5" /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="home-latest" aria-labelledby="activity-title" aria-busy={loading} data-home-reveal="visible">
        <div className="home-section-heading"><h2 id="activity-title">Dernière activité reçue</h2><button className="home-text-action" type="button" onClick={() => onNavigate('activities')}>Toutes les activités<HomeIcon path="m9 5 7 7-7 7" /></button></div>
        <p className="home-data-scope" id="home-data-scope">Vos séances personnelles sont accessibles après connexion.</p>
        <div className="home-latest-body">
          {loading ? <p className="home-activity-state" role="status">Chargement de la dernière activité…</p> : latestActivity ? (
            <>
              {error && <p className="home-refresh-warning" role="alert">Actualisation indisponible. La dernière séance reçue reste affichée.</p>}
              <div className="home-recent-session">
                <div className="home-recent-machine"><span className="home-shortcut-icon"><HomeIcon path={homeLinks.find(link => link.page === 'equipment').icon} /></span><div><span>Équipement</span><h3>{latestActivity.equipmentType === 'TREADMILL' ? 'Tapis de course' : latestActivity.equipmentType}</h3></div></div>
                <dl><div><dt>Durée</dt><dd>{latestActivity.durationMinutes} <span>min</span></dd></div><div><dt>Distance</dt><dd>{latestActivity.distanceKm == null ? 'Non applicable' : <>{latestActivity.distanceKm} <span>km</span></>}</dd></div><div><dt>Date · Europe/Paris</dt><dd className="home-session-date">{formatActivityDate(latestActivity.date)}</dd></div></dl>
              </div>
            </>
          ) : error ? (
            <div className="home-activity-state" role="alert">
              <span className="home-state-symbol" aria-hidden="true"><HomeIcon path="M12 8v5m0 3h.01M10 4 2 19h20L14 4a2 2 0 0 0-4 0" /></span>
              <div><h3>Les activités sont momentanément indisponibles</h3><p>La dernière séance apparaîtra ici lorsque le service sera rétabli.</p></div>
            </div>
          ) : (
            <div className="home-activity-state" role="status"><span className="home-state-symbol" aria-hidden="true"><HomeIcon path="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" /></span><div><h3>Aucune activité reçue pour le moment</h3><p>Les nouvelles séances apparaîtront automatiquement ici.</p></div></div>
          )}
        </div>
      </section>

      <details className="home-services" data-home-reveal="visible">
        <summary><span className="home-services-label"><HomeIcon path="M4 5h16v6H4zm0 9h16v5H4zM8 8h.01M8 16.5h.01" />État des services</span><span className="home-service-status" data-state={loading ? 'loading' : error ? 'unavailable' : 'available'}>{loading ? 'Vérification…' : error ? 'Service indisponible' : 'Activités accessibles'}</span><HomeIcon path="m8 10 4 4 4-4" /></summary>
        <div className="home-services-content">
          <section aria-labelledby="system-title"><h3 id="system-title">État du système</h3><p>{loading ? 'Lecture des activités en cours…' : error ? 'Le service d’activités ne répond pas correctement.' : 'Les activités ont été récupérées depuis le backend.'}</p><p>Actualisation automatique, cinq secondes après chaque tentative.</p>{error && <p className="home-service-error">{error}</p>}<button className="button-outline home-api-test" type="button" onClick={() => setShowApiModal(true)}>Tester la connexion API</button></section>
          <section aria-labelledby="equipment-title"><h3 id="equipment-title">Équipement simulé</h3><p>Tapis de course · état non vérifié</p><p>Le diagnostic API ne vérifie pas la disponibilité d’une machine.</p></section>
        </div>
      </details>
      {showApiModal && <ApiTestModal onClose={() => setShowApiModal(false)} />}
    </div>
  )
}
export default HomePage
