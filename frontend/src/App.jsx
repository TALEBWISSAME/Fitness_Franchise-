
import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar.jsx'
import HomePage from './pages/HomePage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>

      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <div className="content-layout">
        <header className="prototype-header">
          <span>Sprint 1 — Prototype</span>

          <span
            className="user-avatar"
            role="img"
            aria-label="Profil utilisateur (à venir)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7H4z" />
            </svg>
          </span>
        </header>

        <main className="main" id="main-content" tabIndex={-1}>
          {currentPage === 'home' && <HomePage />}
{currentPage === 'activities' && <ActivitiesPage />}
        </main>

        <footer className="footer">
          Fitness Franchise — Prototype Sprint 1
        </footer>
      </div>
    </div>
  )
}

export default App
