import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MapPin, Menu, Scissors, Star, X } from 'lucide-react'
import { getJSON } from '../api'
import ThreeColumnBookingArea from '../ThreeColumnBookingArea'
import HomeProofSections from '../components/HomeProofSections'

const venueBookingURL = 'https://booksy.com/en-us/1548070_high-quality-barbershop_barber-shop_26718_greensboro'

export default function HomePage() {
  const [services, setServices] = useState([])
  const [business, setBusiness] = useState(null)
  const [barbers, setBarbers] = useState([])
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedBarberSlug, setSelectedBarberSlug] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availabilityDates, setAvailabilityDates] = useState([])
  const [availabilityTimes, setAvailabilityTimes] = useState([])
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityNotice, setAvailabilityNotice] = useState('')

  useEffect(() => {
    Promise.all([getJSON('/api/business'), getJSON('/api/services'), getJSON('/api/barbers')])
      .then(([businessData, servicesData, barbersData]) => {
        setBusiness(businessData)
        setServices(servicesData.services)
        setBarbers(barbersData.barbers)
      })
      .catch(() => setError('The live service list is temporarily unavailable.'))
  }, [])

  useEffect(() => {
    if (!modalOpen) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') setModalOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [modalOpen])

  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.slug === selectedBarberSlug) || null,
    [barbers, selectedBarberSlug],
  )

  const selectedService = useMemo(
    () => selectedBarber?.services.find((service) => String(service.id) === String(selectedServiceId)) || null,
    [selectedBarber, selectedServiceId],
  )

  const selectedDateOption = useMemo(
    () => availabilityDates.find((date) => date.value === selectedDate) || null,
    [availabilityDates, selectedDate],
  )

  const selectedTimeOption = useMemo(
    () => availabilityTimes.find((time) => time.value === selectedTime) || null,
    [availabilityTimes, selectedTime],
  )

  const selectedSlotBookingHref = useMemo(() => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) return ''
    const params = new URLSearchParams({
      widgetId: String(selectedBarber.businessId),
      variantId: String(selectedService.variantId),
      date: `${selectedDate}T${selectedTime}`,
    })
    return `${import.meta.env.VITE_API_BASE_URL || ''}/api/booksy-redirect?${params.toString()}`
  }, [selectedBarber, selectedService, selectedDate, selectedTime])

  const loadAvailability = async (barberSlug, serviceId) => {
    setAvailabilityLoading(true)
    setAvailabilityError('')
    setAvailabilityNotice('')
    setAvailabilityDates([])
    setAvailabilityTimes([])
    setAvailabilitySlots([])
    setSelectedDate('')
    setSelectedTime('')

    try {
      const data = await getJSON(`/api/availability?barberSlug=${encodeURIComponent(barberSlug)}&serviceId=${encodeURIComponent(serviceId)}`)
      setAvailabilityDates(data.dates || [])
      setAvailabilitySlots(data.slots || [])
      setAvailabilityTimes([])
      setAvailabilityNotice(data.notice || '')
    } catch {
      setAvailabilityError('Preview availability is not configured for this selection. View current openings on Booksy.')
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const changeAvailabilityDate = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
    setAvailabilityTimes(
      availabilitySlots
        .filter((slot) => slot.date === date)
        .map(({ value, label, period }) => ({ value, label, period })),
    )
  }

  const navigate = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const openBooking = (barber) => {
    setSelectedBarberSlug(barber.slug)
    setSelectedServiceId(String(barber.services[0]?.id || ''))
    setSelectedDate('')
    setSelectedTime('')
    setModalOpen(true)
    if (barber.services[0]?.id) loadAvailability(barber.slug, barber.services[0].id)
  }

  const changeBarber = (slug) => {
    const barber = barbers.find((item) => item.slug === slug)
    setSelectedBarberSlug(slug)
    const firstServiceId = String(barber?.services[0]?.id || '')
    setSelectedServiceId(firstServiceId)
    setSelectedDate('')
    setSelectedTime('')
    if (firstServiceId) loadAvailability(slug, firstServiceId)
  }

  const changeService = (serviceId) => {
    setSelectedServiceId(serviceId)
    setSelectedDate('')
    setSelectedTime('')
    loadAvailability(selectedBarberSlug, serviceId)
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => navigate('home')}>
          <span className="brand-icon"><Scissors size={20} /></span>
          <span><strong>High Quality</strong><small>Barbershop</small></span>
        </button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <button onClick={() => navigate('barbers')}>Barbers</button>
          <button onClick={() => navigate('services')}>Services</button>
          <button onClick={() => navigate('standard')}>Our Standard</button>
          <button onClick={() => navigate('visit')}>Visit</button>
          <a className="button small" href={venueBookingURL} target="_blank" rel="noreferrer">Book Appointment</a>
        </nav>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section id="home" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Greensboro grooming, elevated</p>
          <h1>Precision in every <span>detail.</span></h1>
          <p className="lede">Modern barbering, sharp finishes, and a comfortable experience designed around your style.</p>
          <div className="actions">
            <a className="button" href="/barbers">Choose a Barber <ArrowRight size={18} /></a>
            <a className="button secondary" href="/services">Choose a Service <ArrowRight size={18} /></a>
          </div>
          <div className="facts"><span><Star size={17} fill="currentColor" /> Six independent barbers</span><span><MapPin size={17} /> Greensboro, NC</span></div>
        </div>
        <div className="hero-card"><Scissors size={40} /><div className="hq">HQ</div><div><small>LOOK SHARP. FEEL READY.</small><h2>A clean, confident finish.</h2></div></div>
      </section>

      <section id="barbers" className="barbers-section">
        <p className="eyebrow">Meet the team</p>
        <h2>Choose your barber.</h2>
        <p className="section-intro">Six professionals at 4411 W Gate City Blvd, Suite 105, Greensboro, NC 27407.</p>
        <div className="barber-grid">
          {barbers.map((barber) => {
            const featured = barber.services[0]
            const initials = barber.name.split(' ').map((part) => part[0]).join('').slice(0, 2)
            return (
              <article className="barber-card" key={barber.slug} onClick={() => openBooking(barber)}>
                <div className="barber-photo">{barber.photoUrl ? <img src={barber.photoUrl} alt={`${barber.name} profile`} /> : <span>{initials}</span>}</div>
                <div className="barber-card-body">
                  <span className="availability-badge">BOOKING OPTIONS</span>
                  <p className="barber-business">{barber.businessName}</p>
                  <h3>{barber.name}</h3>
                  {barber.rating && <p className="barber-rating"><Star size={16} fill="currentColor" /> {barber.rating.toFixed(1)} · {barber.reviewCount} reviews</p>}
                  {featured && <p className="featured-service">{featured.name}<br /><strong>{featured.durationMinutes} min · {featured.priceLabel}</strong></p>}
                  <button className="button barber-book-button" onClick={(event) => { event.stopPropagation(); openBooking(barber) }}>Book with {barber.name.split(' ')[0]}</button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section id="services" className="light-section">
        <p className="eyebrow dark">Confirmed services</p><h2>Built around your best look.</h2>
        {error && <p className="error">{error}</p>}
        {!error && services.length === 0 && <p>Loading services...</p>}
        <div className="service-grid">
          {services.slice(0, 8).map((service, index) => (
            <article className="service-card" key={`${service.id}-${index}`}><div><small>0{index + 1}</small><strong>{service.priceLabel}</strong></div><h3>{service.name}</h3><p>{service.description}</p><span><Clock3 size={16} /> {service.durationMinutes} min</span></article>
          ))}
        </div>
      </section>

      <section id="standard" className="standard"><div><p className="eyebrow">Our standard</p><h2>High quality is more than a name.</h2></div><p>Simple booking, attentive service, precision detailing, and a clean result tailored to each client.</p></section>

      <section id="visit" className="visit">
        <div><p className="eyebrow dark">Visit High Quality</p><h2>Your next sharp look starts here.</h2><p><MapPin /> {business?.address || '4411 W Gate City Blvd, Suite 105, Greensboro, NC 27407'}</p><a className="button black" href={venueBookingURL} target="_blank" rel="noreferrer">Book now <ArrowRight size={18} /></a></div>
        <div className="location-card"><Scissors /><strong>Richmond,<br />Virginia</strong></div>
      </section>

      <HomeProofSections />
      <ThreeColumnBookingArea />
      <footer>© 2026 Tutt Enterprises LLC · hqbarbershop.denduluru.com</footer>

      {modalOpen && selectedBarber && (
        <div className="booking-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
          <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close booking dialog"><X size={36} /></button>
            <p className="eyebrow">Tutt Enterprises LLC</p>
            <h2 id="booking-title">Book Your Chair</h2>
            <p className="modal-lede">Select your barber and service, then continue to Booksy for live dates and appointment times.</p>

            <label htmlFor="barber-select">Barber</label>
            <select id="barber-select" value={selectedBarberSlug} onChange={(event) => changeBarber(event.target.value)}>
              {barbers.map((barber) => <option value={barber.slug} key={barber.slug}>{barber.name} · {barber.services.length} {barber.services.length === 1 ? 'service' : 'services'}</option>)}
            </select>

            <label htmlFor="service-select">Service</label>
            <select id="service-select" value={selectedServiceId} onChange={(event) => changeService(event.target.value)}>
              {selectedBarber.services.map((service) => <option value={service.id} key={service.id}>{service.name} · {service.priceLabel} · {service.durationMinutes}m</option>)}
            </select>

            {selectedService && <div className="service-summary"><Clock3 size={20} /><div><strong>{selectedService.name}</strong><span>{selectedService.durationMinutes} minutes · {selectedService.priceLabel}</span></div></div>}

            <div className="phase2a-grid" aria-label="Availability preview controls">
              <div>
                <label htmlFor="date-select">Date</label>
                <select id="date-select" value={selectedDate} onChange={(event) => changeAvailabilityDate(event.target.value)} disabled={availabilityLoading || availabilityDates.length === 0}>
                  <option value="">{availabilityLoading ? 'Loading dates...' : availabilityDates.length ? 'Select a date' : 'No preview dates'}</option>
                  {availabilityDates.map((date) => <option value={date.value} key={date.value}>{date.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="time-select">Time</label>
                <select id="time-select" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} disabled={!selectedDate || availabilityTimes.length === 0}>
                  <option value="">{selectedDate ? 'Select a time' : 'Select a date first'}</option>
                  {availabilityTimes.map((time) => <option value={time.value} key={time.value}>{time.label} · {time.period}</option>)}
                </select>
              </div>
            </div>

            <div className="availability-placeholder" role="status">
              <CalendarDays size={25} />
              <div>
                <strong>{availabilityLoading ? 'Loading availability preview' : selectedTime ? `${availabilityTimes.find((item) => item.value === selectedTime)?.label} selected` : 'Availability preview'}</strong>
                <p>{availabilityError || availabilityNotice || 'Choose a date and time. Current availability must still be confirmed on Booksy.'}</p>
              </div>
            </div>
            {selectedDate && availabilityTimes.length > 0 && (
              <p className="live-times-count">
                {availabilityTimes.length} live {availabilityTimes.length === 1 ? 'time' : 'times'} available on {selectedDateOption?.label}.
              </p>
            )}

            {selectedSlotBookingHref ? (
              <a
                className="button modal-continue"
                href={selectedSlotBookingHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continue with Booksy · {selectedDateOption?.label?.toUpperCase()} at {selectedTimeOption?.label}
                <ArrowRight size={20} />
              </a>
            ) : (
              <button className="button modal-continue" type="button" disabled>
                Select a date and time to continue
              </button>
            )}
            <button className="modal-back" onClick={() => setModalOpen(false)}><ArrowLeft size={17} /> Back to barbers</button>
          </section>
        </div>
      )}
    </main>
  )
}
