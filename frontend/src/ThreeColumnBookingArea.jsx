import { useEffect, useMemo, useState } from 'react'

const apiBase = import.meta.env.VITE_API_BASE_URL || ''

const categoryOrder = [
  'haircuts-fades',
  'haircut-beard-combos',
  'beard-lineup-shape-up',
  'premium-vip-packages',
  'facial-care-add-ons',
]

const categoryLabels = {
  'haircuts-fades': 'Haircuts and Fades',
  'haircut-beard-combos': 'Haircut and Beard Combos',
  'beard-lineup-shape-up': 'Beard, Lineup, and Shape-Up',
  'premium-vip-packages': 'Premium and VIP Packages',
  'facial-care-add-ons': 'Facial Care and Add-ons',
}

// Customer-facing grouping only. Exact Booksy service IDs and variant IDs
// remain attached to each barber-specific offering.
const servicePresentation = {
  8479682: { category: 'haircuts-fades', family: 'haircut', label: 'Haircut' },
  4009828: { category: 'haircuts-fades', family: 'haircut', label: 'Haircut' },
  12271585: { category: 'haircuts-fades', family: 'haircut', label: 'Haircut' },
  13069016: { category: 'haircuts-fades', family: 'haircut', label: 'Haircut' },
  8479699: { category: 'haircuts-fades', family: 'kids-haircut', label: 'Kids Haircut' },
  9208573: { category: 'haircuts-fades', family: 'sunday-haircut', label: 'Sunday Haircut' },

  8479688: { category: 'haircut-beard-combos', family: 'haircut-beard', label: 'Haircut and Beard' },
  8479705: { category: 'haircut-beard-combos', family: 'deluxe-haircut-beard', label: 'Deluxe Haircut and Beard' },
  8479716: { category: 'haircut-beard-combos', family: 'shape-up-beard', label: 'Shape Up and Beard' },

  8479694: { category: 'beard-lineup-shape-up', family: 'beard-service', label: 'Beard Service' },
  8479714: { category: 'beard-lineup-shape-up', family: 'shape-up-lineup', label: 'Shape Up / Lineup' },
  13027604: { category: 'beard-lineup-shape-up', family: 'shape-up-lineup', label: 'Shape Up / Lineup' },
  4009830: { category: 'beard-lineup-shape-up', family: 'beard-color-trim', label: 'Beard Color and Trim' },

  11416985: { category: 'premium-vip-packages', family: 'silver-package', label: 'Premium Silver Service' },
  11417006: { category: 'premium-vip-packages', family: 'gold-package', label: 'Premium Gold Service' },
  11445423: { category: 'premium-vip-packages', family: 'ultimate-package', label: 'Ultimate Grooming Package' },
  12492713: { category: 'premium-vip-packages', family: 'alvarez-vip', label: 'Alvarez VIP' },

  11416980: { category: 'facial-care-add-ons', family: 'deep-facial', label: 'Deep Facial Pore Reset' },
  12853392: { category: 'facial-care-add-ons', family: 'eyebrow-shape', label: 'Eyebrow Shape' },
}

const offeringDetails = (service) =>
  [service.priceLabel, service.durationMinutes ? `${service.durationMinutes} min` : '']
    .filter(Boolean)
    .join(' · ')

const initials = (name) =>
  name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

export default function ThreeColumnBookingArea() {
  const [barbers, setBarbers] = useState([])
  const [selectedFamilyKey, setSelectedFamilyKey] = useState('')
  const [selectedBarberSlug, setSelectedBarberSlug] = useState('')
  const [availability, setAvailability] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [error, setError] = useState('')
  const [widgetOpen, setWidgetOpen] = useState(false)
  const [preferredBarberSlug, setPreferredBarberSlug] = useState('')

  useEffect(() => {
    const barberSlugs = [
      'alejandro',
      'barlyn-german',
      'alvarez-barber',
      'jhonny',
      'landin-newton',
      'wilson-garcia',
    ]
    const businessIdToSlug = {
      '1359189': 'alejandro',
      '629741': 'barlyn-german',
      '1582174': 'alvarez-barber',
      '1792760': 'jhonny',
      '1861163': 'landin-newton',
      '1850913': 'wilson-garcia',
    }

    const inferBarberSlug = (element) => {
      const explicit = element.closest('[data-barber-slug]')?.dataset.barberSlug
      if (explicit && barberSlugs.includes(explicit)) return explicit

      const href = element.closest('a')?.getAttribute('href') || ''
      const normalizedHref = href.toLowerCase()
      const fromBusinessId = Object.entries(businessIdToSlug)
        .find(([businessId]) => normalizedHref.includes(businessId))?.[1]
      if (fromBusinessId) return fromBusinessId
      const fromHref = barberSlugs.find((slug) => normalizedHref.includes(slug))
      if (fromHref) return fromHref

      const cardText = (element.closest('article, .team-card, .barber-card, .team-member')?.textContent || element.textContent || '').toLowerCase()
      const names = {
        alejandro: 'alejandro',
        'barlyn-german': 'barlyn german',
        'alvarez-barber': 'alvarez barber',
        jhonny: 'jhonny',
        'landin-newton': 'landin newton',
        'wilson-garcia': 'wilson garcia',
      }
      return barberSlugs.find((slug) => cardText.includes(names[slug])) || ''
    }

    const handleTeamSelection = (event) => {
      const trigger = event.target.closest('a, button')
      if (!trigger) return
      const label = (trigger.textContent || '').trim().toLowerCase()
      const href = trigger.getAttribute('href') || ''
      const looksLikeTeamChoice =
        label.includes('choose') ||
        label.includes('book') ||
        label.includes('view profile') ||
        href.includes('/barbers/') ||
        href.includes('booksy.com')
      if (!looksLikeTeamChoice) return

      const slug = inferBarberSlug(trigger)
      if (!slug) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      trigger.removeAttribute('target')
      trigger.removeAttribute('rel')
      setPreferredBarberSlug(slug)
      setSelectedFamilyKey('')
      setSelectedBarberSlug('')
      setAvailability(null)
      setSelectedDate('')
      setSelectedTime('')
      setError('')
      setWidgetOpen(false)
      window.setTimeout(() => {
        document.getElementById('booking-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }

    const handleExplicitSelection = (event) => {
      const slug = event.detail?.barberSlug
      if (!barberSlugs.includes(slug)) return
      setPreferredBarberSlug(slug)
      setSelectedFamilyKey('')
      setSelectedBarberSlug('')
      setAvailability(null)
      setSelectedDate('')
      setSelectedTime('')
      setError('')
      setWidgetOpen(false)
      document.getElementById('booking-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    document.addEventListener('click', handleTeamSelection, true)
    window.addEventListener('hq:choose-barber', handleExplicitSelection)
    return () => {
      document.removeEventListener('click', handleTeamSelection, true)
      window.removeEventListener('hq:choose-barber', handleExplicitSelection)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadBarbers = async () => {
      try {
        setLoadingBarbers(true)
        const response = await fetch(`${apiBase}/api/barbers`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) throw new Error(`Barbers request failed (${response.status})`)
        const data = await response.json()
        setBarbers(data.barbers || [])
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Unable to load services and barbers right now.')
        }
      } finally {
        setLoadingBarbers(false)
      }
    }

    loadBarbers()
    return () => controller.abort()
  }, [])

  const categorizedFamilies = useMemo(() => {
    const groupedFamilies = new Map()

    barbers.forEach((barber) => {
      ;(barber.services || []).forEach((service) => {
        const presentation = servicePresentation[service.id]
        if (!presentation) return

        const key = `${presentation.category}:${presentation.family}`
        const current = groupedFamilies.get(key) || {
          key,
          category: presentation.category,
          family: presentation.family,
          label: presentation.label,
          offerings: [],
        }

        current.offerings.push({ barber, service })
        groupedFamilies.set(key, current)
      })
    })

    return categoryOrder.map((category) => ({
      slug: category,
      label: categoryLabels[category],
      families: [...groupedFamilies.values()]
        .filter((family) => family.category === category)
        .sort((left, right) => left.label.localeCompare(right.label)),
    }))
  }, [barbers])

  const visibleCategories = useMemo(() => {
    if (!preferredBarberSlug) return categorizedFamilies
    return categorizedFamilies
      .map((category) => ({
        ...category,
        families: category.families.filter((family) =>
          family.offerings.some(({ barber }) => barber.slug === preferredBarberSlug),
        ),
      }))
      .filter((category) => category.families.length > 0)
  }, [categorizedFamilies, preferredBarberSlug])

  const allFamilies = useMemo(
    () => categorizedFamilies.flatMap((category) => category.families),
    [categorizedFamilies],
  )

  const selectedFamily = useMemo(
    () => allFamilies.find((family) => family.key === selectedFamilyKey) || null,
    [allFamilies, selectedFamilyKey],
  )

  const selectedOffering = useMemo(
    () => selectedFamily?.offerings.find(({ barber }) => barber.slug === selectedBarberSlug) || null,
    [selectedFamily, selectedBarberSlug],
  )

  const selectedDateTimes = useMemo(
    () => (availability?.slots || []).filter((slot) => slot.date === selectedDate),
    [availability, selectedDate],
  )

  const selectFamily = (family) => {
    setSelectedFamilyKey(family.key)
    setAvailability(null)
    setSelectedDate('')
    setSelectedTime('')
    setError('')
    setWidgetOpen(false)

    if (preferredBarberSlug) {
      const offering = family.offerings.find(({ barber }) => barber.slug === preferredBarberSlug)
      if (offering) {
        selectBarber(offering)
        return
      }
    }
    setSelectedBarberSlug('')
  }

  const selectBarber = async (offering) => {
    setPreferredBarberSlug(offering.barber.slug)
    setSelectedBarberSlug(offering.barber.slug)
    setAvailability(null)
    setSelectedDate('')
    setSelectedTime('')
    setError('')
    setWidgetOpen(false)
    setLoadingAvailability(true)

    try {
      const query = new URLSearchParams({
        barberSlug: offering.barber.slug,
        serviceId: String(offering.service.id),
      })
      const response = await fetch(`${apiBase}/api/availability?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`Availability request failed (${response.status})`)
      const data = await response.json()
      setAvailability(data)
      if ((data.dates || []).length === 1) setSelectedDate(data.dates[0].value)
    } catch {
      setError('Live availability is temporarily unavailable for this selection.')
    } finally {
      setLoadingAvailability(false)
    }
  }

  const chooseDate = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const selectedDateLabel =
    availability?.dates?.find((date) => date.value === selectedDate)?.label || selectedDate
  const selectedTimeLabel =
    selectedDateTimes.find((time) => time.value === selectedTime)?.label || selectedTime

  const widgetURL = selectedOffering && selectedDate && selectedTime
    ? `https://booksy.com/widget/index.html?id=${encodeURIComponent(selectedOffering.barber.businessId)}` +
      `&variantId=${encodeURIComponent(selectedOffering.service.variantId)}` +
      `&date=${encodeURIComponent(`${selectedDate}T${selectedTime}`)}` +
      '&lang=en&country=us'
    : 'about:blank'

  return (
    <section id="booking-area" className="three-column-booking" aria-labelledby="booking-area-title">
      <div className="booking-heading">
        <p className="booking-kicker">Live online booking</p>
        <h2 id="booking-area-title">Service. Barber. Time.</h2>
        <p>Start with a category and service, choose a matching barber, then select live availability.</p>
      </div>

      {preferredBarberSlug && (
        <div className="preferred-barber-banner">
          <span>
            Showing services for <strong>{barbers.find((barber) => barber.slug === preferredBarberSlug)?.name || 'selected barber'}</strong>
          </span>
          <button type="button" onClick={() => {
            setPreferredBarberSlug('')
            setSelectedFamilyKey('')
            setSelectedBarberSlug('')
            setAvailability(null)
            setSelectedDate('')
            setSelectedTime('')
          }}>
            Show all barbers
          </button>
        </div>
      )}

      <div className="booking-columns">
        <section className="booking-column" aria-labelledby="service-column-title">
          <span className="column-number">1</span>
          <h3 id="service-column-title">Choose a service</h3>
          <p className="column-help">Five categories, 15 service families, and 19 exact Booksy offerings.</p>

          <div className="category-list">
            {loadingBarbers && <p className="booking-state">Loading services…</p>}
            {!loadingBarbers && visibleCategories.map((category, categoryIndex) => (
              <details className="service-category" key={category.slug} open={categoryIndex === 0}>
                <summary>
                  <span>{category.label}</span>
                  <small>{category.families.length}</small>
                </summary>
                <div className="selection-list">
                  {category.families.map((family) => (
                    <button
                      type="button"
                      key={family.key}
                      className={`selection-card ${selectedFamilyKey === family.key ? 'is-selected' : ''}`}
                      onClick={() => selectFamily(family)}
                    >
                      <strong>{family.label}</strong>
                      <span>{family.offerings.length} {family.offerings.length === 1 ? 'barber' : 'barbers'}</span>
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="booking-column" aria-labelledby="barber-column-title">
          <span className="column-number">2</span>
          <h3 id="barber-column-title">Choose a barber</h3>
          <p className="column-help">Only barbers who provide the selected service are shown.</p>

          <div className="selection-list barber-list">
            {!selectedFamily && <p className="booking-state">Select a service to see matching barbers.</p>}
            {selectedFamily?.offerings
              .filter(({ barber }) => !preferredBarberSlug || barber.slug === preferredBarberSlug)
              .map((offering) => (
              <button
                type="button"
                key={`${offering.barber.slug}-${offering.service.id}`}
                className={`selection-card barber-selection ${selectedBarberSlug === offering.barber.slug ? 'is-selected' : ''}`}
                onClick={() => selectBarber(offering)}
              >
                <span className="barber-initials">{initials(offering.barber.name)}</span>
                <span className="barber-selection-copy">
                  <strong>{offering.barber.name}</strong>
                  <span>{offering.service.name}</span>
                  <small>{offeringDetails(offering.service)}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="booking-column booking-column-availability" aria-labelledby="time-column-title">
          <span className="column-number">3</span>
          <h3 id="time-column-title">Choose date and time</h3>
          <p className="column-help">Live availability for the selected exact Booksy service.</p>

          {!selectedOffering && <p className="booking-state">Select a barber to load live availability.</p>}
          {loadingAvailability && <p className="booking-state">Loading live availability…</p>}
          {error && <p className="booking-error">{error}</p>}

          {availability && !loadingAvailability && (
            <>
              <label className="booking-field">
                <span>Date</span>
                <select value={selectedDate} onChange={(event) => chooseDate(event.target.value)}>
                  <option value="">Select date</option>
                  {(availability.dates || []).map((date) => (
                    <option key={date.value} value={date.value}>{date.label}</option>
                  ))}
                </select>
              </label>

              <div className="booking-field">
                <span>Time</span>
                {!selectedDate && <p className="booking-state compact">Choose a date first.</p>}
                {selectedDate && selectedDateTimes.length === 0 && (
                  <p className="booking-state compact">No times are currently available.</p>
                )}
                {selectedDate && selectedDateTimes.length > 0 && (
                  <div className="time-grid">
                    {selectedDateTimes.map((time) => (
                      <button
                        type="button"
                        key={`${time.date}-${time.value}`}
                        className={selectedTime === time.value ? 'is-selected' : ''}
                        onClick={() => setSelectedTime(time.value)}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            className="booking-continue"
            disabled={!selectedOffering || !selectedDate || !selectedTime}
            onClick={() => setWidgetOpen(true)}
          >
            {selectedTime
              ? `Continue · ${selectedDateLabel} at ${selectedTimeLabel}`
              : 'Select service, barber, date and time'}
          </button>
        </section>
      </div>

      {widgetOpen && selectedOffering && (
        <div className="booking-widget-modal" role="dialog" aria-modal="true" aria-labelledby="booking-widget-title">
          <button className="booking-widget-backdrop" type="button" aria-label="Close booking" onClick={() => setWidgetOpen(false)} />
          <section className="booking-widget-dialog">
            <header>
              <div>
                <strong id="booking-widget-title">Book with {selectedOffering.barber.name}</strong>
                <span>{selectedOffering.service.name} · {selectedDateLabel} at {selectedTimeLabel}</span>
              </div>
              <button type="button" aria-label="Close booking" onClick={() => setWidgetOpen(false)}>×</button>
            </header>
            <iframe
              src={widgetURL}
              title={`${selectedOffering.barber.name} Booksy booking widget`}
              allow="geolocation; microphone; camera; payment"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <footer>Secure booking provided by Booksy.</footer>
          </section>
        </div>
      )}
    </section>
  )
}
