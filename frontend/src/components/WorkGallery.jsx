import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PLACEHOLDER_NOTICE, WORK_FILTERS, WORK_ITEMS } from '../config/socialProof'

export default function WorkGallery({ limit = 0, compact = false }) {
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const visible = useMemo(() => {
    const items = filter === 'all' ? WORK_ITEMS : WORK_ITEMS.filter((item) => item.serviceFamily === filter)
    return limit ? items.slice(0, limit) : items
  }, [filter, limit])

  if (!WORK_ITEMS.length) {
    return <div className="proof-empty">
      <h3>Work gallery coming soon</h3>
      <p>Approved, optimized work photos will appear here. No stock images are presented as completed customer work.</p>
      <Link to="/book">View Live Booking</Link>
    </div>
  }

  return <>
    {!compact && <div className="proof-filters">{WORK_FILTERS.map(([value, label]) => <button type="button" className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{label}</button>)}</div>}
    <p className="placeholder-disclosure">{PLACEHOLDER_NOTICE}</p>
    <div className="work-grid">{visible.map((item) => <article key={item.id} className="work-card">
      <button type="button" className="work-placeholder-image" onClick={() => setActive(item)}><img src={item.imageUrl} alt={item.imageAlt}/><span>AI PLACEHOLDER</span></button>
      <div><strong>{item.caption}</strong><span>{item.barberName}</span></div>
    </article>)}</div>
    {active && <div className="proof-lightbox" role="dialog" aria-modal="true" aria-label={active.caption}>
      <button className="proof-backdrop" type="button" aria-label="Close" onClick={() => setActive(null)}/>
      <section><header><strong>{active.caption}</strong><button type="button" onClick={() => setActive(null)}>×</button></header><div className="lightbox-placeholder-image"><img src={active.imageUrl} alt={active.imageAlt}/><span>AI PLACEHOLDER</span></div><footer><span>{active.barberName}</span><Link to={`/book?barber=${active.barberSlug}&service=${active.serviceFamily}`}>Book This Look</Link></footer></section>
    </div>}
  </>
}
