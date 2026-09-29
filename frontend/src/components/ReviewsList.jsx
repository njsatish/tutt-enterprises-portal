import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PLACEHOLDER_NOTICE, VERIFIED_REVIEWS } from '../config/socialProof'
const apiBase = import.meta.env.VITE_API_BASE_URL || ''

export default function ReviewsList({ limit = 0, barberSlug = '' }) {
  const [barbers, setBarbers] = useState([])
  useEffect(() => { fetch(`${apiBase}/api/barbers`).then((r) => r.ok ? r.json() : Promise.reject()).then((d) => setBarbers(d.barbers || [])).catch(() => setBarbers([])) }, [])
  const reviews = useMemo(() => {
    const items = barberSlug ? VERIFIED_REVIEWS.filter((review) => review.barberSlug === barberSlug) : VERIFIED_REVIEWS
    return limit ? items.slice(0, limit) : items
  }, [barberSlug, limit])
  const ratedBarbers = barbers.filter((barber) => typeof barber.rating === 'number' && typeof barber.reviewCount === 'number')

  return <>
    {!!ratedBarbers.length && <div className="rating-summary-grid">{ratedBarbers.map((barber) => <article key={barber.slug}><strong>{barber.rating.toFixed(1)} ★</strong><span>{barber.reviewCount} Booksy reviews</span><Link to={`/book?barber=${barber.slug}`}>{barber.name}</Link></article>)}</div>}
    {reviews.length ? <><p className="placeholder-disclosure">{PLACEHOLDER_NOTICE}</p><div className="review-grid">{reviews.map((review) => <article className="review-card" key={review.id}><span className="placeholder-badge">AI PLACEHOLDER</span><div aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}</div><blockquote>{review.reviewText}</blockquote><footer><strong>{review.customerDisplayName}</strong><span>{review.reviewDate} · {review.source}</span></footer></article>)}</div></> : <div className="proof-empty"><h3>Verified review text coming soon</h3><p>Rating totals above come from the barber data already published by the API. Written review quotes will be added only after approval.</p><Link to="/book">Book an Appointment</Link></div>}
  </>
}
