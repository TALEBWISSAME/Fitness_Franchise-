import { useEffect, useId, useRef, useState } from 'react'
import BrandMark from './BrandMark.jsx'
import './TopNavigation.css'

const pages = [
  ['home', 'Accueil', 'Votre point de départ', 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9'],
  ['equipment', 'Équipements', 'Machines et espace réservation', 'M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9'],
  ['activities', 'Activités', 'Les séances disponibles', 'M5 20v-5m5 5V11m5 9V7m5 13V3'],
  ['statistics', 'Mes statistiques', 'Votre rythme d’entraînement', 'M4 19h16M5 14l5-5 4 3 5-7'],
  ['profile', 'Mon profil', 'Votre espace adhérent', 'M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
  ['login', 'Connexion', 'Accéder à votre compte', 'M14 4h6v16h-6M3 12h12m-4-4 4 4-4 4'],
  ['register', 'Inscription', 'Préparer votre espace personnel', 'M4 21c0-4.5 3.5-7 8-7m4-7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m2 9v6m-3-3h6'],
]

export default function TopNavigation({ currentPage, onNavigate, user }) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const navigationId = useId()

  function navigate(page) {
    setOpen(false)
    setHidden(false)
    onNavigate(page)
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }

  useEffect(() => {
    let previousY = window.scrollY
    let accumulated = 0
    let frame = null
    function update() {
      frame = null
      // Clamp overscroll, including the elastic bounce on touch devices.
      const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const y = Math.max(0, Math.min(window.scrollY, maximum))
      const delta = y - previousY
      previousY = y
      if (open || y <= 48 || rootRef.current?.querySelector(':focus-visible')) {
        accumulated = 0
        setHidden(false)
        return
      }
      accumulated = Math.sign(delta) === Math.sign(accumulated) ? accumulated + delta : delta
      if (accumulated >= 24 && y > 96) {
        setHidden(true)
        accumulated = 0
      } else if (accumulated <= -12) {
        setHidden(false)
        accumulated = 0
      }
    }
    function handleScroll() {
      if (frame === null) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [open, currentPage])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const activeLink = panel.querySelector('[aria-current="page"]') || panel.querySelector('button')
    activeLink?.focus({ preventScroll: true })

    function handlePointerDown(event) {
      if (rootRef.current?.contains(event.target)) return
      const focusWasInside = panel.contains(document.activeElement)
      setOpen(false)
      if (focusWasInside) requestAnimationFrame(() => {
        if (!document.activeElement?.isConnected || document.activeElement === document.body) triggerRef.current?.focus({ preventScroll: true })
      })
    }
    function handleFocus(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.focus({ preventScroll: true })
        return
      }
      if (!panel.contains(document.activeElement)) return
      const links = [...panel.querySelectorAll('.topnav-link')]
      const index = links.indexOf(document.activeElement)
      const next = event.key === 'ArrowDown' ? (index + 1) % links.length
        : event.key === 'ArrowUp' ? (index - 1 + links.length) % links.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : null
      if (next !== null) {
        event.preventDefault()
        links[next].focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('focusin', handleFocus)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <header className="topbar" data-hidden={hidden && !open} ref={rootRef} onFocusCapture={() => setHidden(false)}>
      <div className="topbar-inner">
        <button className="topbar-brand" type="button" onClick={() => navigate('home')} aria-label="Fitness Franchise — Accueil">
          <BrandMark />
        </button>
        <button className="topnav-trigger" type="button" ref={triggerRef} aria-expanded={open} aria-controls={navigationId} aria-label={open ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'} onClick={() => setOpen(value => !value)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true) } }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" focusable="false"><path d={open ? 'm6 6 12 12M6 18 18 6' : 'M4 8h16M4 16h11'} /></svg><span>Menu</span>
        </button>
        <span className="topbar-context">{pages.find(page => page[0] === currentPage)?.[1]}</span>
        <button className="user-avatar topbar-account" type="button" aria-label="Accéder à mon compte" title="Accéder à mon compte" onClick={() => navigate(user ? 'profile' : 'login')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" /></svg>
        </button>
      </div>
      <nav className="topnav-panel" data-open={open} inert={!open} aria-hidden={!open} id={navigationId} ref={panelRef} aria-label="Navigation principale">
        <div className="topnav-panel-heading"><span>Explorez votre espace</span><span>Fitness Franchise</span></div>
        <ul className="topnav-list">{pages.map(([page, label, , path], index) => <li key={page} style={{ '--link-order': index }}>
          <button className="topnav-link" type="button" aria-current={currentPage === page ? 'page' : undefined} onClick={() => navigate(page)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={path} /></svg>
            <span><strong>{label}</strong></span>
            <span className="topnav-link-arrow" aria-hidden="true">↗</span>
          </button>
        </li>)}</ul>
        <p className="topnav-panel-note">Version en développement</p>
      </nav>
    </header>
  )
}
