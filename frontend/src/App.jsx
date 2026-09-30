import { useEffect, useState } from 'react'
import { loadPortal } from './api.js'
import TwoColumnBookingArea from './components/TwoColumnBookingArea.jsx'
import WorkGallery from './components/WorkGallery.jsx'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { loadPortal().then(setData).catch(() => setError('Start the local Go API on port 8080, then refresh this page.')) }, [])
  const goToBooking = () => document.getElementById('booking-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (error) return <main className="center-state"><h1>Tutt Enterprises LLC</h1><p>{error}</p></main>
  if (!data) return <main className="center-state"><h1>Loading Tutt Enterprises…</h1></main>
  const { business, staff, services } = data
  const barber = staff[0]
  return <>
    <header className="site-header"><div className="wrap nav"><a className="brand" href="#top"><img src={business.logoURL} alt="" /><span>{business.name}</span></a><nav><a href="#services">Services</a><a href="#barber">Barber</a><a href="#visit">Visit</a><button className="button" type="button" onClick={goToBooking}>Book Now</button></nav></div></header>
    <main id="top">
      <section className="hero"><div className="wrap hero-grid"><div><p className="eyebrow">Richmond, Virginia Barbershop</p><h1>Clean cuts.<br />Real confidence.</h1><p className="lede">Precision barbering for adults, youth, first-time clients, and families. Book directly with {barber.name}.</p><div className="actions"><button className="button" type="button" onClick={goToBooking}>View Live Availability</button><a className="button secondary" href="#services">Explore Services</a></div><div className="trust"><div><strong>{business.reviewsStars.toFixed(1)}</strong><span>Booksy stars</span></div><div><strong>{business.reviewsCount}</strong><span>customer reviews</span></div><div><strong>{services.length}</strong><span>bookable services</span></div></div></div><div className="hero-photo"><img src={business.photoURL} alt="Tutt Enterprises LLC shop" /><span>Appointment only · Richmond, VA</span></div></div></section>
      <section className="services" id="services"><div className="wrap"><div className="section-head"><div><p className="eyebrow">Booksy services</p><h2>Choose your service.</h2></div><p>Use the booking area below to select a service, live date, and available time.</p></div><button className="button" type="button" onClick={goToBooking}>Start Booking</button></div></section>
      <TwoColumnBookingArea services={services} />
      <WorkGallery onBook={goToBooking} />
      <section id="barber"><div className="wrap barber-grid"><img className="barber-photo" src={barber.photoURL} alt={`${barber.name}, barber`} /><div><p className="eyebrow">Your barber</p><h2>{barber.name}</h2><p className="lede">One barber, one focused experience.</p><button className="button" type="button" onClick={goToBooking}>Book with Stacy</button></div></div></section>
      <section className="visit" id="visit"><div className="wrap"><p className="eyebrow">Plan your visit</p><h2>Richmond, Virginia.</h2><div className="visit-grid"><article><h3>Address</h3><p>{business.addressLine1}<br />{business.addressLine2}<br />{business.cityStateZip}</p><a href={business.mapsURL} target="_blank" rel="noreferrer">Open in Maps</a></article><article><h3>Contact</h3><p><a href={`tel:${business.phoneE164}`}>{business.phone}</a><br /><a href={`mailto:${business.email}`}>{business.email}</a></p></article><article><h3>Hours</h3>{business.hours.map((line) => <p key={line}>{line}</p>)}</article></div></div></section>
    </main>
    <footer><div className="wrap">© 2026 {business.name} · Appointments completed through Booksy</div></footer>
  </>
}
