export default function EquipmentIcon({ type }) {
  const paths = {
    TREADMILL: 'M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-13h3M13 8h4M7 19h9',
    BIKE: 'M8 18a4 4 0 1 1-8 0 4 4 0 0 1 8 0m16 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 18l5-9 6 9M8 9h8l4 9M14 5h4M7 5h3',
    ELLIPTICAL: 'M3 20h18M6 17l4-9m4 9 4-9M8 4l2 4m6-4 2 4M4 17h5m4 0h6',
    ROWING: 'M3 20h18M5 16h10l5-9M9 16v-5l5-4M15 4l5 3',
    STRENGTH: 'M5 21V3h14v18M5 7h14M9 11h6v7H9zM12 7v4',
    FUNCTIONAL: 'M8 8V6a4 4 0 0 1 8 0v2M7 8h10l4 12H3L7 8Z',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[type] || 'M4 4h16v16H4zM8 8h8m-8 4h8m-8 4h4'} /></svg>
}
