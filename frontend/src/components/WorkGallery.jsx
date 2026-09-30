import { useEffect, useState } from 'react'
import { workGallery } from '../config/workGallery.js'

export default function WorkGallery({ onBook }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const active = activeIndex === null ? null : workGallery[activeIndex]

  useEffect(() => {
    if (!active) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowRight') setActiveIndex((activeIndex + 1) % workGallery.length)
      if (event.key === 'ArrowLeft') setActiveIndex((activeIndex - 1 + workGallery.length) % workGallery.length)
    }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active, activeIndex])

  const bookThisLook = () => {
    setActiveIndex(null)
    onBook()
  }

  return (
    <section className="work-gallery-section" id="gallery" aria-labelledby="gallery-title">
      <div className="wrap">
        <div className="section-head">
          <div><p className="eyebrow">Recent work</p><h2 id="gallery-title">Cuts by Stacy.</h2></div>
          <p>Selected portfolio examples from Tutt Enterprises LLC. Choose a service below to book a personalized appointment.</p>
        </div>
        <div className="work-gallery-grid">
          {workGallery.map((item, index) => (
            <button className="work-gallery-card" type="button" key={item.id} onClick={() => setActiveIndex(index)} aria-label={`View ${item.caption}`}>
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              <span>{item.caption}</span>
            </button>
          ))}
        </div>
        <button className="button gallery-book-button" type="button" onClick={onBook}>Book This Look</button>
      </div>

      {active && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={active.caption}>
          <button className="gallery-lightbox-backdrop" type="button" aria-label="Close gallery" onClick={() => setActiveIndex(null)} />
          <div className="gallery-lightbox-dialog">
            <button className="gallery-lightbox-close" type="button" aria-label="Close gallery" onClick={() => setActiveIndex(null)}>×</button>
            <button className="gallery-lightbox-nav previous" type="button" aria-label="Previous photo" onClick={() => setActiveIndex((activeIndex - 1 + workGallery.length) % workGallery.length)}>‹</button>
            <img src={active.src} alt={active.alt} />
            <button className="gallery-lightbox-nav next" type="button" aria-label="Next photo" onClick={() => setActiveIndex((activeIndex + 1) % workGallery.length)}>›</button>
            <footer><strong>{active.caption}</strong><button className="button" type="button" onClick={bookThisLook}>Book This Look</button></footer>
          </div>
        </div>
      )}
    </section>
  )
}
