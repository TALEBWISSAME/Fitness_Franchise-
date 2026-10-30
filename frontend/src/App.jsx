
import { useState } from 'react'
import './App.css'
import { useAuth } from './authContext.js'
import ConnectedStatistics from './components/ConnectedStatistics.jsx'
import TopNavigation from './components/TopNavigation.jsx'
import HomePage from './pages/HomePage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

import EquipmentPage from './pages/EquipmentPage.jsx'

function App() {
  const { user, loading, error, logout } = useAuth()
  const [logoutError, setLogoutError] = useState('')
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="app app-shell">
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>

      <TopNavigation user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <div className="content-layout">
        <main className="main" id="main-content" tabIndex={-1}>
          {user && <div><span>{user.displayName}</span> <button className="button-outline" type="button" onClick={async () => {
            try { await logout(); setLogoutError(''); setCurrentPage('login') } catch { setLogoutError('Déconnexion impossible. Réessayez.') }
          }}>Se déconnecter</button></div>}
          {logoutError && <p role="alert">{logoutError}</p>}
          <div key={user?.id ?? 'anonymous'}>
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'equipment' && <EquipmentPage />}
          {currentPage === 'activities' && <ActivitiesPage />}
          {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
          {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
          {currentPage === 'profile' && <ProfilePage onNavigate={setCurrentPage} user={user} loading={loading} error={error} />}
          {currentPage === 'statistics' && <ConnectedStatistics onNavigate={setCurrentPage} />}
        </div></main>

        <footer className="footer">
          <span className="footer-brand">Fitness Franchise</span>
          <span className="footer-version">Version en développement</span>
        </footer>
      </div>
    </div>
  )
}

export default App


