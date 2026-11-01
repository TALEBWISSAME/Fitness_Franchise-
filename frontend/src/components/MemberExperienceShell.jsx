import { useEffect, useState } from 'react'
import { useAuth } from '../authContext.js'
import BrandMark from './BrandMark.jsx'

const NAV_ITEMS = [
  ['home', 'Accueil', 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9'],
  ['statistics', 'Mes statistiques', 'M4 19h16M6 16v-5m6 5V6m6 10V9'],
  ['activities', 'Mes séances', 'M4 12h4l2-6 4 12 2-6h4'],
  ['equipment', 'Catalogue', 'M4 7h16M4 12h16M4 17h16'],
  ['profile', 'Mon profil', 'M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
]

function NavigationIcon({ path }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
}

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches
}

export default function MemberExperienceShell({ activePage, onNavigate, children }) {
  const { user, logout } = useAuth()
  const [isMobile, setIsMobile] = useState(isMobileViewport)
  const [menuOpen, setMenuOpen] = useState(() => !isMobileViewport())
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    const breakpoint = window.matchMedia('(min-width: 701px)')
    const syncNavigation = event => {
      setIsMobile(!event.matches)
      setMenuOpen(event.matches)
    }
    breakpoint.addEventListener('change', syncNavigation)
    return () => breakpoint.removeEventListener('change', syncNavigation)
  }, [])

  async function signOut() {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      onNavigate('login')
    } catch {
      setLogoutError('Déconnexion impossible. Réessayez.')
    } finally {
      setLoggingOut(false)
    }
  }

  function navigateFromMenu(page) {
    if (isMobile) setMenuOpen(false)
    onNavigate(page)
  }

  return (
    <div className="statistics-experience member-experience" data-menu-open={menuOpen}>
      <button className="statistics-menu-backdrop" type="button" aria-label="Fermer le menu"
        tabIndex={menuOpen ? -1 : 0} onClick={() => setMenuOpen(false)} />
      <aside className="statistics-sidebar" id="member-navigation" aria-label="Navigation espace adhérent"
        aria-hidden={!menuOpen && isMobile} inert={!menuOpen && isMobile}>
        <button className="statistics-brand" type="button" onClick={() => navigateFromMenu('home')}
          aria-label="Fitness Franchise — Accueil">
          <BrandMark />
        </button>
        <nav className="statistics-side-nav" aria-label="Navigation principale">
          {NAV_ITEMS.map(([page, label, icon]) => (
            <button key={page} className="statistics-nav-link" type="button"
              aria-current={page === activePage ? 'page' : undefined}
              aria-label={label} title={label} onClick={() => navigateFromMenu(page)}>
              <NavigationIcon path={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="statistics-sidebar-bottom">
          {logoutError && <p className="statistics-logout-error" role="alert">{logoutError}</p>}
          {user && <button className="statistics-nav-link statistics-logout" type="button"
            onClick={signOut} disabled={loggingOut}>
            <NavigationIcon path="M10 17l5-5-5-5m5 5H3m9-9h8v18h-8" />
            <span>{loggingOut ? 'Déconnexion…' : 'Se déconnecter'}</span>
          </button>}
        </div>
      </aside>
      <div className="statistics-page-column">
        <header className="statistics-topbar">
          <button className="statistics-menu-toggle" type="button" aria-expanded={menuOpen}
            aria-controls="member-navigation"
            aria-label={menuOpen ? 'Réduire ou fermer le menu latéral' : 'Ouvrir le menu latéral'}
            onClick={() => setMenuOpen(open => !open)}>
            <NavigationIcon path={menuOpen ? 'm6 6 12 12M6 18 18 6' : 'M3 8h18M3 16h18'} />
            <span>Menu</span>
          </button>
          <div className="statistics-topbar-account">
            <span className="statistics-topbar-avatar" aria-hidden="true">
              {(user?.displayName || user?.email || 'A').trim().charAt(0).toUpperCase()}
            </span>
            <span>{user?.displayName || 'Invité'}</span>
          </div>
        </header>
        <div className="statistics-main">{children}</div>
      </div>
    </div>
  )
}
