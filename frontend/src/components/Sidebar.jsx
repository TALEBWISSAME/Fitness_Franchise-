
function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <svg
          className="brand-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M8 12h8M3 9v6m3-8v10m12-10v10m3-8v6M3 12h3m12 0h3" />
        </svg>
        <span>Fitness<br />Franchise</span>
      </div>

      <nav aria-label="Navigation principale">
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
        </ul>
      </nav>
      
    </aside>
  )
}

export default Sidebar


