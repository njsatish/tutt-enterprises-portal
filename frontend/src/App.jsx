import { useEffect, useMemo, useState } from 'react'
import { loadPortal } from './api.js'

const categoryOrder = ['first-time-customers', 'family-deals', 'adults', 'youth']

function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <h4>{service.name}</h4>
      <p>{service.description}</p>
      <div className="service-meta"><strong>{service.priceLabel}</strong><span>{service.durationMinutes} min</span></div>
      <a href={service.bookingURL} target="_blank" rel="noreferrer">Book service</a>
    </article>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPortal().then(setData).catch(() => setError('Start the local Go API on port 8080, then refresh this page.'))
  }, [])

  const grouped = useMemo(() => {
    if (!data) return []
    return categoryOrder.map((slug) => ({
      slug,
      label: data.services.find((service) => service.category === slug)?.categoryLabel || slug,
      services: data.services.filter((service) => service.category === slug),
    }))
  }, [data])

  if (error) return <main className="center-state"><h1>Tutt Enterprises LLC</h1><p>{error}</p></main>
  if (!data) return <main className="center-state"><h1>Loading Tutt Enterprises…</h1></main>

  const { business, staff } = data
  const barber = staff[0]

  return (
    <>
      <header className="site-header">
        <div className="wrap nav">
          <a className="brand" href="#top"><img src={business.logoURL} alt="" /><span>{business.name}</span></a>
          <nav><a href="#services">Services</a><a href="#barber">Barber</a><a href="#visit">Visit</a><a className="button" href={business.bookingURL} target="_blank" rel="noreferrer">Book Now</a></nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">Richmond, Virginia Barbershop</p>
              <h1>Clean cuts.<br />Real confidence.</h1>
              <p className="lede">Precision barbering for adults, youth, first-time clients, and families. Book directly with {barber.name}.</p>
              <div className="actions"><a className="button" href={business.bookingURL} target="_blank" rel="noreferrer">View Booksy Availability</a><a className="button secondary" href="#services">Explore Services</a></div>
              <div className="trust"><div><strong>{business.reviewsStars.toFixed(1)}</strong><span>Booksy stars</span></div><div><strong>{business.reviewsCount}</strong><span>customer reviews</span></div><div><strong>{data.services.length}</strong><span>bookable services</span></div></div>
            </div>
            <div className="hero-photo"><img src={business.photoURL} alt="Tutt Enterprises LLC shop" /><span>Appointment only · Richmond, VA</span></div>
          </div>
        </section>

        <section className="services" id="services">
          <div className="wrap">
            <div className="section-head"><div><p className="eyebrow">Booksy services</p><h2>Choose your service.</h2></div><p>Pricing and duration come from the confirmed Tutt Enterprises Booksy profile. Final availability is confirmed on Booksy.</p></div>
            {grouped.map((group, index) => <div className="category" key={group.slug}><h3><span>{index + 1}</span>{group.label}</h3><div className="service-grid">{group.services.map((service) => <ServiceCard key={service.id} service={service} />)}</div></div>)}
          </div>
        </section>

        <section id="barber">
          <div className="wrap barber-grid"><img className="barber-photo" src={barber.photoURL} alt={`${barber.name}, barber`} /><div><p className="eyebrow">Your barber</p><h2>{barber.name}</h2><p className="lede">One barber, one focused experience. Choose the service that fits your visit and complete the appointment through Booksy.</p><div className="facts"><div><strong>Position</strong><span>{barber.position}</span></div><div><strong>Services</strong><span>{data.services.length} options</span></div><div><strong>Booking policy</strong><span>{business.bookingPolicy}</span></div><div><strong>Service model</strong><span>Appointment only</span></div></div><a className="button" href={business.bookingURL} target="_blank" rel="noreferrer">Book with Stacy</a></div></div>
        </section>

        <section className="visit" id="visit"><div className="wrap"><p className="eyebrow">Plan your visit</p><h2>Richmond, Virginia.</h2><div className="visit-grid"><article><h3>Address</h3><p>{business.addressLine1}<br />{business.addressLine2}<br />{business.cityStateZip}</p><a href={business.mapsURL} target="_blank" rel="noreferrer">Open in Maps</a></article><article><h3>Contact</h3><p><a href={`tel:${business.phoneE164}`}>{business.phone}</a><br /><a href={`mailto:${business.email}`}>{business.email}</a></p></article><article><h3>Hours</h3>{business.hours.map((line) => <p key={line}>{line}</p>)}</article></div></div></section>
      </main>
      <footer><div className="wrap">© 2026 {business.name} · Appointments completed through Booksy</div></footer>
    </>
  )
}
