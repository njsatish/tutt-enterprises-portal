import { useEffect, useMemo, useState } from 'react'

const apiBase = import.meta.env.VITE_API_BASE_URL || ''
const staff = { id: 46537, slug: 'stacy-tutt-iii', name: 'Stacy Tutt III', businessId: 38443 }
const categoryOrder = ['first-time-customers', 'family-deals', 'adults', 'youth']

const formatDetails = (service) => [service.priceLabel, `${service.durationMinutes} min`].filter(Boolean).join(' · ')

export default function TwoColumnBookingArea({ services }) {
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [availability, setAvailability] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [widgetOpen, setWidgetOpen] = useState(false)

  const selectedService = useMemo(
    () => services.find((service) => String(service.id) === selectedServiceId) || null,
    [services, selectedServiceId],
  )

  const categories = useMemo(() => categoryOrder.map((category) => ({
    category,
    label: services.find((service) => service.category === category)?.categoryLabel || category,
    services: services.filter((service) => service.category === category),
  })), [services])

  const selectedDateTimes = useMemo(
    () => (availability?.slots || []).filter((slot) => slot.date === selectedDate),
    [availability, selectedDate],
  )

  useEffect(() => {
    if (!widgetOpen) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setWidgetOpen(false) }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [widgetOpen])

  const chooseService = async (service) => {
    setSelectedServiceId(String(service.id))
    setAvailability(null)
    setSelectedDate('')
    setSelectedTime('')
    setWidgetOpen(false)
    setError('')
    setLoading(true)

    try {
      const query = new URLSearchParams({ barberSlug: staff.slug, serviceId: String(service.id) })
      const response = await fetch(`${apiBase}/api/availability?${query.toString()}`, { headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error(`Availability request failed (${response.status})`)
      const data = await response.json()
      setAvailability(data)
      if ((data.dates || []).length === 1) setSelectedDate(data.dates[0].value)
    } catch {
      setError('Live availability is not configured for this service yet.')
    } finally {
      setLoading(false)
    }
  }

  const chooseDate = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const selectedDateLabel = availability?.dates?.find((date) => date.value === selectedDate)?.label || selectedDate
  const selectedTimeLabel = selectedDateTimes.find((time) => time.value === selectedTime)?.label || selectedTime
  const widgetURL = selectedService && selectedDate && selectedTime
    ? `https://booksy.com/widget/index.html?id=${staff.businessId}` +
      `&variantId=${encodeURIComponent(selectedService.variantId)}` +
      `&date=${encodeURIComponent(`${selectedDate}T${selectedTime}`)}` +
      '&lang=en&country=us'
    : 'about:blank'

  return (
    <section id="booking-area" className="two-column-booking" aria-labelledby="booking-title">
      <div className="wrap">
        <header className="booking-heading">
          <p className="eyebrow">Live online booking</p>
          <h2 id="booking-title">Service. Date. Time.</h2>
          <p>Choose one of Stacy Tutt III’s services, then select a live date and time.</p>
        </header>

        <div className="booking-columns">
          <section className="booking-column" aria-labelledby="service-title">
            <span className="column-number">1</span>
            <h3 id="service-title">Choose a service</h3>
            <p className="column-help">17 exact Booksy services in four categories.</p>
            <div className="category-list">
              {categories.map((group, index) => (
                <details className="service-category" key={group.category} open={index === 0}>
                  <summary><span>{group.label}</span><small>{group.services.length}</small></summary>
                  <div className="booking-selection-list">
                    {group.services.map((service) => (
                      <button type="button" key={service.id} className={`booking-selection ${selectedServiceId === String(service.id) ? 'is-selected' : ''}`} onClick={() => chooseService(service)}>
                        <strong>{service.name}</strong><span>{formatDetails(service)}</span>
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="booking-column" aria-labelledby="availability-title">
            <span className="column-number">2</span>
            <h3 id="availability-title">Choose date and time</h3>
            <p className="column-help">Live availability for the selected service with {staff.name}.</p>
            {!selectedService && <p className="booking-state">Select a service to load availability.</p>}
            {loading && <p className="booking-state">Loading live availability…</p>}
            {error && <p className="booking-error">{error}</p>}
            {availability && !loading && <>
              <label className="booking-field"><span>Date</span><select value={selectedDate} onChange={(event) => chooseDate(event.target.value)}><option value="">Select date</option>{(availability.dates || []).map((date) => <option key={date.value} value={date.value}>{date.label}</option>)}</select></label>
              <div className="booking-field"><span>Time</span>{!selectedDate && <p className="booking-state compact">Choose a date first.</p>}{selectedDate && selectedDateTimes.length === 0 && <p className="booking-state compact">No times are currently available.</p>}{selectedDateTimes.length > 0 && <div className="time-grid">{selectedDateTimes.map((time) => <button type="button" key={`${time.date}-${time.value}`} className={selectedTime === time.value ? 'is-selected' : ''} onClick={() => setSelectedTime(time.value)}>{time.label}</button>)}</div>}</div>
            </>}
            <button type="button" className="booking-continue" disabled={!selectedService || !selectedDate || !selectedTime} onClick={() => setWidgetOpen(true)}>{selectedTime ? `Continue · ${selectedDateLabel} at ${selectedTimeLabel}` : 'Select service, date and time'}</button>
          </section>
        </div>
      </div>

      {widgetOpen && selectedService && <div className="booking-widget-modal" role="dialog" aria-modal="true" aria-labelledby="booking-widget-title"><button className="booking-widget-backdrop" type="button" aria-label="Close booking" onClick={() => setWidgetOpen(false)} /><section className="booking-widget-dialog"><header><div><strong id="booking-widget-title">Book with {staff.name}</strong><span>{selectedService.name} · {selectedDateLabel} at {selectedTimeLabel}</span></div><button type="button" aria-label="Close booking" onClick={() => setWidgetOpen(false)}>×</button></header><iframe src={widgetURL} title={`${staff.name} Booksy booking widget`} allow="geolocation; microphone; camera; payment" referrerPolicy="strict-origin-when-cross-origin" /><footer>Secure booking provided by Booksy.</footer></section></div>}
    </section>
  )
}
