import { useEffect, useMemo, useState } from 'react'
import { loadPortal } from './api.js'

const categoryOrder = ['first-time-customers', 'family-deals', 'adults', 'youth']

function ServiceCard({ service, onBook }) {
  return <article className="service-card"><h4>{service.name}</h4><p>{service.description}</p><div className="service-meta"><strong>{service.priceLabel}</strong><span>{service.durationMinutes} min</span></div><button className="service-book" type="button" onClick={() => onBook(service)}>Book service</button></article>
}

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [widgetOpen, setWidgetOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const openWidget = (service = null) => { setSelectedService(service); setWidgetOpen(true) }
  const closeWidget = () => { setWidgetOpen(false); setSelectedService(null) }

  useEffect(() => { loadPortal().then(setData).catch(() => setError('Start the local Go API on port 8080, then refresh this page.')) }, [])
  useEffect(() => {
    if (!widgetOpen) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') closeWidget() }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKeyDown) }
  }, [widgetOpen])

  const grouped = useMemo(() => {
    if (!data) return []
    return categoryOrder.map((slug) => ({ slug, label: data.services.find((service) => service.category === slug)?.categoryLabel || slug, services: data.services.filter((service) => service.category === slug) }))
  }, [data])

  if (error) return <main className="center-state"><h1>Tutt Enterprises LLC</h1><p>{error}</p></main>
  if (!data) return <main className="center-state"><h1>Loading Tutt Enterprises…</h1></main>
  const { business, staff } = data
  const barber = staff[0]

  return <>
    <header className="site-header"><div className="wrap nav"><a className="brand" href="#top"><img src={business.logoURL} alt="" /><span>{business.name}</span></a><nav><a href="#services">Services</a><a href="#barber">Barber</a><a href="#visit">Visit</a><button className="button" type="button" onClick={() => openWidget()}>Book Now</button></nav></div></header>
    <main id="top">
      <section className="hero"><div className="wrap hero-grid"><div><p className="eyebrow">Richmond, Virginia Barbershop</p><h1>Clean cuts.<br />Real confidence.</h1><p className="lede">Precision barbering for adults, youth, first-time clients, and families. Book directly with {barber.name}.</p><div className="actions"><button className="button" type="button" onClick={() => openWidget()}>View Booksy Availability</button><a className="button secondary" href="#services">Explore Services</a></div><div className="trust"><div><strong>{business.reviewsStars.toFixed(1)}</strong><span>Booksy stars</span></div><div><strong>{business.reviewsCount}</strong><span>customer reviews</span></div><div><strong>{data.services.length}</strong><span>bookable services</span></div></div></div><div className="hero-photo"><img src={business.photoURL} alt="Tutt Enterprises LLC shop" /><span>Appointment only · Richmond, VA</span></div></div></section>
      <section className="services" id="services"><div className="wrap"><div className="section-head"><div><p className="eyebrow">Booksy services</p><h2>Choose your service.</h2></div><p>Pricing and duration come from the confirmed Tutt Enterprises Booksy profile. Final availability is confirmed on Booksy.</p></div>{grouped.map((group, index) => <div className="category" key={group.slug}><h3><span>{index + 1}</span>{group.label}</h3><div className="service-grid">{group.services.map((service) => <ServiceCard key={service.id} service={service} onBook={openWidget} />)}</div></div>)}</div></section>
      <section id="barber"><div className="wrap barber-grid"><img className="barber-photo" src={barber.photoURL} alt={`${barber.name}, barber`} /><div><p className="eyebrow">Your barber</p><h2>{barber.name}</h2><p className="lede">One barber, one focused experience. Choose the service that fits your visit and complete the appointment through Booksy.</p><div className="facts"><div><strong>Position</strong><span>{barber.position}</span></div><div><strong>Services</strong><span>{data.services.length} options</span></div><div><strong>Booking policy</strong><span>{business.bookingPolicy}</span></div><div><strong>Service model</strong><span>Appointment only</span></div></div><button className="button" type="button" onClick={() => openWidget()}>Book with Stacy</button></div></div></section>
      <section className="visit" id="visit"><div className="wrap"><p className="eyebrow">Plan your visit</p><h2>Richmond, Virginia.</h2><div className="visit-grid"><article><h3>Address</h3><p>{business.addressLine1}<br />{business.addressLine2}<br />{business.cityStateZip}</p><a href={business.mapsURL} target="_blank" rel="noreferrer">Open in Maps</a></article><article><h3>Contact</h3><p><a href={`tel:${business.phoneE164}`}>{business.phone}</a><br /><a href={`mailto:${business.email}`}>{business.email}</a></p></article><article><h3>Hours</h3>{business.hours.map((line) => <p key={line}>{line}</p>)}</article></div></div></section>
    </main>
    <footer><div className="wrap">© 2026 {business.name} · Appointments completed through Booksy</div></footer>
    {widgetOpen && <div className="booksy-modal" role="dialog" aria-modal="true" aria-labelledby="booksy-title"><button className="booksy-backdrop" type="button" aria-label="Close booking" onClick={closeWidget} /><section className="booksy-dialog"><header className="booksy-header"><div><strong id="booksy-title">Book with Stacy Tutt III</strong><span>{selectedService ? `${selectedService.name} · Select this service in Booksy` : 'Select a service, date, and time'}</span></div><button className="booksy-close" type="button" onClick={closeWidget} aria-label="Close Booksy widget">×</button></header><iframe src="https://booksy.com/widget/index.html?id=38443&lang=en&country=us&mode=dialog&theme=default" title="Stacy Tutt III Booksy booking widget" allow="payment" /><footer className="booksy-fallback"><span>If the widget does not load, use the Booksy fallback.</span><a href={business.bookingURL} target="_blank" rel="noreferrer">Open Booksy</a></footer></section></div>}
  </>
}
