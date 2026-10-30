
import { useState } from 'react'
import './App.css'
import { useAuth } from './authContext.js'
import ConnectedStatistics from './components/ConnectedStatistics.jsx'
import TopNavigation from './components/TopNavigation.jsx'
import HomePage from './pages/PublicHomePage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

import EquipmentPage from './pages/EquipmentPage.jsx'
import './design-system.css'
import './pages/FitnessPremiumHome.css'
import './pages/FitnessPremiumEquipment.css'

function App() {
  const { user, loading, error, logout } = useAuth()
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  const [equipmentCategory, setEquipmentCategory] = useState('')
  const publicPage = currentPage === 'home' || currentPage === 'equipment'

  function navigate(page, category = '') {
    if (page === 'equipment') setEquipmentCategory(category)
    setCurrentPage(page)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('main-content')?.focus({ preventScroll: true })
    })
  }

  return (
    <div className={`app app-shell${publicPage ? ' app-home' : ''}`}>
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>

      {!publicPage && <TopNavigation user={user}
        currentPage={currentPage}
        onNavigate={navigate}
      />}

      <div className="content-layout">
        <main className="main" id="main-content" tabIndex={-1}>
          {user && !publicPage && <div className="member-toolbar"><span><span className="member-presence" />Bonjour, <strong>{user.displayName}</strong></span><div><button className="button-outline" type="button" onClick={() => navigate('statistics')}>Ma progression</button> <button className="button-outline" type="button" disabled={loggingOut} onClick={async () => {
            setLoggingOut(true)
            try { await logout(); setLogoutError(''); navigate('login') } catch { setLogoutError('Déconnexion impossible. Réessayez.') }
            finally { setLoggingOut(false) }
          }}>{loggingOut ? 'Déconnexion…' : 'Se déconnecter'}</button></div></div>}
          {logoutError && <p className="ui-error" role="alert">{logoutError}</p>}
          <div key={user?.id ?? 'anonymous'}>
          {currentPage === 'home' && <HomePage onNavigate={navigate} />}
          {currentPage === 'equipment' && <EquipmentPage onNavigate={navigate} initialCategory={equipmentCategory} />}
          {currentPage === 'activities' && <ActivitiesPage />}
          {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
          {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
          {currentPage === 'profile' && <ProfilePage onNavigate={navigate} user={user} loading={loading} error={error} />}
          {currentPage === 'statistics' && <ConnectedStatistics onNavigate={navigate} />}
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


