// Libellés de présentation, pas une énumération ni un contrat backend.
export const equipmentTypeLabel = type => ({ TREADMILL: 'Tapis de course', BIKE: 'Vélo', ELLIPTICAL: 'Elliptique', ROWING: 'Rameur', STRENGTH: 'Musculation' })[type] || type
export const equipmentStatusLabel = status => ({ available: 'Disponible', busy: 'Occupé', maintenance: 'Maintenance' })[status] || status
