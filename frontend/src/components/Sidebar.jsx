
import { useEffect, useRef, useState } from 'react'

function Sidebar({ currentPage, onNavigate: navigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 701px)')
    function handleResize() {
      if (desktop.matches) {
        setMenuOpen(false)
        if (document.activeElement === menuButtonRef.current) {
          document.querySelector('.navigation-item[aria-current="page"]')?.focus()
        }
      } else if (document.activeElement?.closest('#primary-navigation')) {
        menuButtonRef.current?.focus()
      }
    }
    desktop.addEventListener('change', handleResize)
    return () => desktop.removeEventListener('change', handleResize)
  }, [])

  function onNavigate(page) {
    navigate(page)
    setMenuOpen(false)
    if (window.matchMedia('(max-width: 700px)').matches) menuButtonRef.current?.focus()
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <aside className="sidebar">
      <div className="brand">
        <svg
          className="brand-icon"
          viewBox="0 0 40 40"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M5 8h14l-2 5h-7v5h7l-2 5h-5v9H5Z" />
          <path className="brand-monogram-accent" d="M23 8h14l-2 5h-7v5h7l-2 5h-5v9h-5Z" />
        </svg>
        <span className="brand-name">Fitness <span>Franchise</span></span>
      </div>

      <button
        ref={menuButtonRef}
        className="sidebar-toggle"
        type="button"
        aria-label={menuOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen(previous => !previous)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d={menuOpen ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
        <span>Menu</span>
      </button>
      <nav id="primary-navigation" aria-label="Navigation principale" data-open={menuOpen}>
        <ul className="navigation-list">
          <li>
            <button
              className={`navigation-item ${currentPage === 'home' ? 'active' : ''}`}
              type="button"
              onClick={() => onNavigate('home')}
              aria-current={currentPage === 'home' ? 'page' : undefined}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" />
              </svg>
              Accueil
            </button>
          </li>

          <li>
            <button className={`navigation-item ${currentPage === 'equipment' ? 'active' : ''}`} type="button" onClick={() => onNavigate('equipment')} aria-current={currentPage === 'equipment' ? 'page' : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9" /></svg>
              Équipements
            </button>
          </li>
          <li>
            <button
  className={`navigation-item ${currentPage === 'activities' ? 'active' : ''}`}
  type="button"
  onClick={() => onNavigate('activities')}
  aria-current={currentPage === 'activities' ? 'page' : undefined}
>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M5 20v-5m5 5V11m5 9V7m5 13V3" />
              </svg>
              Activités
             
            </button>
          </li>
          {[
            ['statistics', 'Mes statistiques', 'M5 20v-5m5 5V11m5 9V7m5 13V3'],
            ['profile', 'Mon profil', 'M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
            ['login', 'Connexion', 'M14 4h6v16h-6M3 12h12m-4-4 4 4-4 4'],
            ['register', 'Inscription', 'M4 21c0-4.5 3.5-7 8-7m4-7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m2 9v6m-3-3h6'],
          ].map(([page, label, iconPath]) => (
            <li key={page}>
              <button
                className={`navigation-item ${currentPage === page ? 'active' : ''}`}
                type="button"
                onClick={() => onNavigate(page)}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d={iconPath} />
                </svg>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
    </aside>
  )
}

export default Sidebar


