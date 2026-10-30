import { lazy, Suspense, useState } from 'react'
import EquipmentCard from '../components/equipment/EquipmentCard.jsx'
import EquipmentDialog from '../components/equipment/EquipmentDialog.jsx'
import EquipmentIcon from '../components/equipment/EquipmentIcon.jsx'
import { equipmentStatusLabel, equipmentTypeLabel } from '../components/equipment/equipmentPresentation.js'
import './EquipmentPage.css'

const EquipmentPreview = import.meta.env.DEV ? lazy(() => import('../components/equipment/EquipmentPreview.dev.jsx')) : null

function EquipmentLayout({ children, actions }) {
  return (
    <section className="equipment-page" aria-labelledby="equipment-page-title">
      <header className="equipment-page-heading"><div><h1 id="equipment-page-title">Équipements</h1><p>Découvrez les machines de nos salles</p></div>{actions}</header>
      {children}
    </section>
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
function EquipmentCatalog({ equipment, loading, error, demonstration = false, onReserve, reservationsContent }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const machines = equipment || []
  const types = [...new Set(machines.map(machine => machine.type).filter(Boolean))]
  const statuses = [...new Set(machines.map(machine => machine.status).filter(Boolean))]
  const filtered = machines.filter(machine => (!query.trim() || (machine.name || '').toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr'))) && (!type || machine.type === type) && (!status || machine.status === status))

  return (
    <>
      <form className="equipment-filters" onSubmit={event => event.preventDefault()}>
        <div className="auth-field equipment-search"><label htmlFor="equipment-search">Rechercher une machine</label><div className="equipment-search-control"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg><input id="equipment-search" type="search" placeholder="Nom de la machine…" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
        <div className="auth-field"><label htmlFor="equipment-type">Type d’équipement</label><select id="equipment-type" value={type} onChange={event => setType(event.target.value)}><option value="">Tous les types</option>{types.map(value => <option key={value} value={value}>{equipmentTypeLabel(value)}</option>)}</select></div>
        {statuses.length > 0 && <div className="auth-field"><label htmlFor="equipment-status">{demonstration ? 'Statut fictif' : 'Statut'}</label><select id="equipment-status" value={status} onChange={event => setStatus(event.target.value)}><option value="">Tous les statuts</option>{statuses.map(value => <option key={value} value={value}>{equipmentStatusLabel(value)}</option>)}</select></div>}
        <button className="button-outline" type="button" onClick={() => { setQuery(''); setType(''); setStatus('') }}>Réinitialiser</button>
      </form>
      <div className="equipment-results-heading"><h2>Les machines</h2><span role="status">{loading ? 'Chargement…' : error || equipment === null ? 'Indisponible' : `${filtered.length} machine${filtered.length === 1 ? '' : 's'}`}</span></div>
      {loading ? <EquipmentState title="Chargement des équipements…">Le catalogue sera affiché ici.</EquipmentState>
        : error ? <EquipmentState title="Catalogue momentanément indisponible" error>Impossible de charger les équipements : {error}</EquipmentState>
          : equipment === null ? <EquipmentState title="Le catalogue sera bientôt disponible">Le catalogue des équipements n’est pas encore disponible. Le service backend reste à intégrer.</EquipmentState>
            : machines.length === 0 ? <EquipmentState title="Aucun équipement disponible">Le catalogue ne contient pas encore de machines.</EquipmentState>
              : filtered.length === 0 ? <EquipmentState title="Aucune machine ne correspond à vos critères">Essayez un autre nom ou réinitialisez les filtres.</EquipmentState>
                : <div className="equipment-grid">{filtered.map((machine, index) => <EquipmentCard key={machine.id ?? index} machine={machine} demonstration={demonstration} onDetails={setSelected} onReserve={onReserve} />)}</div>}
      {reservationsContent || <section className="equipment-reservations" aria-labelledby="equipment-reservations-title"><h2 id="equipment-reservations-title">Mes réservations</h2><p className="equipment-state">Les réservations réelles ne sont pas encore disponibles. Aucune réservation ne peut être effectuée ici.</p></section>}
      {selected && <EquipmentDialog title={selected.name || 'Détails de l’équipement'} onClose={() => setSelected(null)}>
        {selected.type && <div className="equipment-detail-intro"><span className="equipment-machine-icon"><EquipmentIcon type={selected.type} /></span><span>{equipmentTypeLabel(selected.type)}</span></div>}
        {demonstration && <p className="equipment-demo-notice">Données de démonstration — aucune disponibilité réelle.</p>}
        <dl className="profile-details">
          {selected.type && <div><dt>Type</dt><dd>{equipmentTypeLabel(selected.type)}</dd></div>}
          {selected.id != null && <div><dt>Identifiant</dt><dd>{selected.id}</dd></div>}
          {selected.location && <div><dt>Salle / emplacement</dt><dd>{selected.location}</dd></div>}
          {selected.status && <div><dt>{demonstration ? 'Statut fictif' : 'Statut'}</dt><dd>{equipmentStatusLabel(selected.status)}</dd></div>}
        </dl>
        {!selected.type && selected.id == null && !selected.location && !selected.status && <p>Les autres informations ne sont pas renseignées.</p>}
      </EquipmentDialog>}
    </>
  )
}

export default function EquipmentPage({ equipment = null, loading = false, error = '' }) {
  const content = <EquipmentCatalog equipment={equipment} loading={loading} error={error} />
  const renderPage = (body, actions) => <EquipmentLayout actions={actions}>{body}</EquipmentLayout>
  return import.meta.env.DEV ? <Suspense fallback={renderPage(content)}><EquipmentPreview renderPage={renderPage} renderCatalog={props => <EquipmentCatalog {...props} />}>{content}</EquipmentPreview></Suspense> : renderPage(content)
}
