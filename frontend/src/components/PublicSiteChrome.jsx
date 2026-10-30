import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../authContext.js'
import BrandMark from './BrandMark.jsx'

export function SiteArrow({ diagonal = false }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} /></svg>
}

function useSiteNavigation(onNavigate, currentPage) {
  const { user } = useAuth()
  const section = (event, id) => {
    if (currentPage === 'home') return
    event.preventDefault()
    onNavigate('home')
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }))
  }
  return { user, section, account: () => onNavigate(user ? 'profile' : 'login') }
}

export function PublicHeader({ onNavigate, currentPage = 'home' }) {
  const { section, account } = useSiteNavigation(onNavigate, currentPage)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)
  const header = useRef(null)
  useEffect(() => {
    if (!menuOpen) return
    const closeOutside = event => { if (!header.current?.contains(event.target)) setMenuOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [menuOpen])
  const linkTo = (event, id) => { setMenuOpen(false); section(event, id) }
  const navigate = page => { setMenuOpen(false); onNavigate(page) }
  return <header className="fh-header" ref={header} onKeyDown={event => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() } }}>
    <a className="fh-brand" href="#accueil" aria-label="Fitness Franchise - Accueil" onClick={event => linkTo(event, 'accueil')}><BrandMark /></a>
    <button className="fh-menu-toggle" ref={menuButton} type="button" aria-expanded={menuOpen} aria-controls="fh-navigation" aria-label={menuOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'} onClick={() => setMenuOpen(!menuOpen)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={menuOpen ? 'm6 6 12 12M6 18 18 6' : 'M3 8h18M3 16h18'} /></svg>
    </button>
    <nav className={`fh-navigation ${menuOpen ? 'is-open' : ''}`} id="fh-navigation" aria-label="Navigation principale">
      <a href="#accueil" onClick={event => linkTo(event, 'accueil')}>Accueil</a>
      <a href="#nos-espaces" onClick={event => linkTo(event, 'nos-espaces')}>Nos espaces</a>
      <button type="button" className="fh-nav-link" aria-current={currentPage === 'equipment' ? 'page' : undefined} onClick={() => navigate('equipment')}>Équipements</button>
      <a href="#notre-concept" onClick={event => linkTo(event, 'notre-concept')}>À propos</a>
      <button type="button" className="fh-account" onClick={() => { setMenuOpen(false); account() }}>Mon espace <SiteArrow /></button>
    </nav>
  </header>
}

export function PublicFooter({ onNavigate, currentPage = 'home' }) {
  const { user, section, account } = useSiteNavigation(onNavigate, currentPage)
  return <footer className="fh-footer">
    <div className="fh-footer-identity"><a href="#accueil" aria-label="Fitness Franchise - Retour à l’accueil" onClick={event => section(event, 'accueil')}><BrandMark /></a><p>L’énergie d’avancer.<br />Le plaisir de progresser.</p></div>
    <div className="fh-footer-column"><h3>Navigation</h3><a href="#accueil" onClick={event => section(event, 'accueil')}>Accueil</a><a href="#nos-espaces" onClick={event => section(event, 'nos-espaces')}>Nos espaces</a><button type="button" onClick={() => onNavigate('equipment')}>Équipements</button></div>
    <div className="fh-footer-column"><h3>Mon compte</h3><button type="button" onClick={account}>Mon espace</button><button type="button" onClick={() => onNavigate(user ? 'activities' : 'login')}>Mes séances</button><button type="button" onClick={() => onNavigate(user ? 'statistics' : 'login')}>Mes statistiques</button></div>
    <div className="fh-footer-column"><h3>Fitness Franchise</h3><a href="#notre-concept" onClick={event => section(event, 'notre-concept')}>À propos</a><a href="#votre-progression" onClick={event => section(event, 'votre-progression')}>Le suivi sportif</a><p>Projet universitaire<br />M1 Informatique</p></div>
    <p className="fh-footer-copyright">© 2026 Fitness Franchise · Projet universitaire</p>
  </footer>
}
