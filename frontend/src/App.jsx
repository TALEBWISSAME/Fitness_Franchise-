
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

