import { useState } from 'react'

export default function BrandMark() {
  const [failed, setFailed] = useState(false)
  return <span className="brand-mark" aria-hidden="true">
    <span className="brand-mark-emblem">{failed ? <span className="brand-mark-fallback">FF</span> : <img src="/brand/fitness-franchise-logo-transparent.png" width="99" height="66" alt="" onError={() => setFailed(true)} />}</span>
    <span className="brand-mark-name">FITNESS<span>FRANCHISE<span className="brand-mark-dot">.</span></span></span>
  </span>
}
