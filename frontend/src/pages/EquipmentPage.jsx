import { lazy, Suspense, useState } from 'react'
import EquipmentCard from '../components/equipment/EquipmentCard.jsx'
import EquipmentDialog from '../components/equipment/EquipmentDialog.jsx'
import EquipmentIcon from '../components/equipment/EquipmentIcon.jsx'
import { equipmentStatusLabel, equipmentTypeLabel } from '../components/equipment/equipmentPresentation.js'
import './EquipmentPage.css'
import { PublicHeader, PublicFooter } from '../components/PublicSiteChrome.jsx'
import EquipmentUniverses from '../components/equipment/EquipmentUniverses.jsx'
import { equipmentUniverses, machineUniverse } from '../components/equipment/equipmentUniverses.js'
import { projectEquipment } from '../components/equipment/projectEquipment.js'
import EquipmentMedia from '../components/equipment/EquipmentMedia.jsx'

const EquipmentPreview = import.meta.env.DEV ? lazy(() => import('../components/equipment/EquipmentPreview.dev.jsx')) : null

function EquipmentLayout({ children, actions, category, onDiscover, onNavigate }) {
  return (
    <div className="franchise-home equipment-public-shell">
    <PublicHeader onNavigate={onNavigate} currentPage="equipment" />
    <section className="equipment-page" aria-labelledby="equipment-page-title">
      <header className="equipment-page-heading"><div><p className="fh-eyebrow">NOS UNIVERS</p><h1 id="equipment-page-title">4 univers d’entraînement</h1><p>Découvrez les 20 modèles du projet. Trouvez votre mouvement.</p></div></header>
      <EquipmentUniverses selected={category} onDiscover={onDiscover} />
      <p className="premium-image-note">Photographies d’illustration générées · aucun équipement installé ou disponible n’est garanti par ces visuels.</p>
      <div className="equipment-catalog-heading" id="equipment-catalog" tabIndex={-1}><div><p className="fh-eyebrow">LE CATALOGUE</p><h2>Explorez les machines</h2></div>{actions}</div>
      {children}
    </section>
    <PublicFooter onNavigate={onNavigate} currentPage="equipment" />
    </div>
  )
}

function EquipmentState({ title, children, error = false }) {
  return <div className={`equipment-state${error ? ' equipment-state-error' : ''}`} role={error ? 'alert' : 'status'}>
    <span className="equipment-state-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={error ? 'M12 8v5m0 3h.01M10 4 2 19h20L14 4a2 2 0 0 0-4 0' : 'M4 7h16v13H4zM8 7V4h8v3M8 12h8M8 16h5'} /></svg></span>
    <div><h3>{title}</h3><p>{children}</p></div>
  </div>
}

// Modèle de présentation interne seulement : un futur adaptateur sera nécessaire
// après validation du véritable contrat API. Aucun endpoint n’est présumé ici.
function EquipmentCatalog({ equipment, loading, error, category, onCategoryReset, demonstration = false, onReserve, reservationsContent }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const reference = equipment === null && !loading && !error
  const machines = reference ? projectEquipment : equipment || []
  const types = [...new Set(machines.map(machine => machine.type).filter(Boolean))]
  const statuses = [...new Set(machines.map(machine => machine.status).filter(Boolean))]
  const filtered = machines.filter(machine => (!category || machineUniverse(machine) === category) && (!query.trim() || (machine.name || '').toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr'))) && (!type || machine.type === type) && (!status || machine.status === status))
  const categoryName = equipmentUniverses.find(item => item.id === category)?.name

  return (
    <>
      {reference && <p className="equipment-demo-notice">Catalogue de référence du projet · 20 modèles définis. L’inventaire réel par salle et ses disponibilités ne sont pas encore connectés.</p>}
      {categoryName && <div className="equipment-category-selection"><span>Univers : <strong>{categoryName}</strong></span><button className="button-outline" type="button" onClick={onCategoryReset}>Tous les univers</button></div>}
      <form className="equipment-filters" onSubmit={event => event.preventDefault()}>
        <div className="auth-field equipment-search"><label htmlFor="equipment-search">Rechercher une machine</label><div className="equipment-search-control"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg><input id="equipment-search" type="search" placeholder="Nom de la machine…" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
        <div className="auth-field"><label htmlFor="equipment-type">Type d’équipement</label><select id="equipment-type" value={type} onChange={event => setType(event.target.value)}><option value="">Tous les types</option>{types.map(value => <option key={value} value={value}>{machines.find(machine => machine.type === value)?.referenceModel ? machines.find(machine => machine.type === value).name : equipmentTypeLabel(value)}</option>)}</select></div>
        {statuses.length > 0 && <div className="auth-field"><label htmlFor="equipment-status">{demonstration ? 'Statut fictif' : 'Statut'}</label><select id="equipment-status" value={status} onChange={event => setStatus(event.target.value)}><option value="">Tous les statuts</option>{statuses.map(value => <option key={value} value={value}>{equipmentStatusLabel(value)}</option>)}</select></div>}
        <button className="button-outline" type="button" onClick={() => { setQuery(''); setType(''); setStatus(''); onCategoryReset() }}>Réinitialiser</button>
      </form>
      <div className="equipment-results-heading"><h2>{reference ? 'Les modèles de référence' : 'Les machines'}</h2><span role="status">{loading ? 'Chargement…' : error ? 'Indisponible' : `${filtered.length} ${reference ? 'modèle' : 'machine'}${filtered.length === 1 ? '' : 's'}`}</span></div>
      {loading ? <EquipmentState title="Chargement des équipements…">Le catalogue sera affiché ici.</EquipmentState>
        : error ? <EquipmentState title="Catalogue momentanément indisponible" error>Impossible de charger les équipements : {error}</EquipmentState>
          : machines.length === 0 ? <EquipmentState title="Aucun équipement disponible">Le catalogue ne contient pas encore de machines.</EquipmentState>
              : filtered.length === 0 ? <EquipmentState title="Aucune machine ne correspond à vos critères">Essayez un autre nom ou réinitialisez les filtres.</EquipmentState>
                : <div className="equipment-grid">{filtered.map((machine, index) => <EquipmentCard key={machine.id ?? index} machine={machine} demonstration={demonstration} onDetails={setSelected} onReserve={onReserve} />)}</div>}
      {reservationsContent || <section className="equipment-reservations" aria-labelledby="equipment-reservations-title"><h2 id="equipment-reservations-title">Mes réservations</h2><p className="equipment-state">Les réservations réelles ne sont pas encore disponibles. Aucune réservation ne peut être effectuée ici.</p></section>}
      {selected && <EquipmentDialog title={selected.name || 'Détails de l’équipement'} variant="machine" onClose={() => setSelected(null)}>
        <div className="equipment-detail-layout">
        <EquipmentMedia machine={selected} detailed />
        <div className="equipment-detail-information">
        {selected.type && <div className="equipment-detail-intro"><span className="equipment-machine-icon"><EquipmentIcon type={selected.referenceModel ? equipmentUniverses.find(item => item.id === selected.category)?.icon : selected.type} /></span><span>{selected.referenceModel ? 'Modèle de référence du projet' : equipmentTypeLabel(selected.type)}</span></div>}
        {selected.description && <p className="equipment-detail-description">{selected.description}</p>}
        {selected.referenceModel && <p className="equipment-demo-notice">Cette fiche décrit un modèle prévu au projet, sans disponibilité ni salle réelle associée.</p>}
        {demonstration && <p className="equipment-demo-notice">Données de démonstration — aucune disponibilité réelle.</p>}
        <dl className="profile-details">
          {selected.type && <div><dt>Type</dt><dd>{selected.referenceModel ? selected.name : equipmentTypeLabel(selected.type)}</dd></div>}
          {selected.category && <div><dt>Catégorie</dt><dd>{equipmentUniverses.find(item => item.id === selected.category)?.name || selected.category}</dd></div>}
          {selected.id != null && <div><dt>Identifiant</dt><dd>{selected.id}</dd></div>}
          {selected.location && <div><dt>Salle / emplacement</dt><dd>{selected.location}</dd></div>}
          {selected.status && <div><dt>{demonstration ? 'Statut fictif' : 'Statut'}</dt><dd>{equipmentStatusLabel(selected.status)}</dd></div>}
        </dl>
        {!selected.type && selected.id == null && !selected.location && !selected.status && <p>Les autres informations ne sont pas renseignées.</p>}
        </div>
        </div>
      </EquipmentDialog>}
    </>
  )
}

export default function EquipmentPage({ equipment = null, loading = false, error = '', onNavigate, initialCategory = '' }) {
  const [category, setCategory] = useState(initialCategory)
  function discover(value) {
    setCategory(value)
    requestAnimationFrame(() => {
      const catalog = document.getElementById('equipment-catalog')
      catalog?.scrollIntoView({ behavior: 'instant', block: 'start' })
      catalog?.focus({ preventScroll: true })
    })
  }
  const shared = { category, onCategoryReset: () => setCategory('') }
  const content = <EquipmentCatalog {...shared} equipment={equipment} loading={loading} error={error} />
  const renderPage = (body, actions) => <EquipmentLayout actions={actions} category={category} onDiscover={discover} onNavigate={onNavigate}>{body}</EquipmentLayout>
  return import.meta.env.DEV ? <Suspense fallback={renderPage(content)}><EquipmentPreview renderPage={renderPage} renderCatalog={props => <EquipmentCatalog {...props} {...shared} />}>{content}</EquipmentPreview></Suspense> : renderPage(content)
}
