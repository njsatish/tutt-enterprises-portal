import { useEffect, useState } from 'react'
import { workGallery } from '../config/workGallery.js'

const previewLimit = 3

export default function WorkGallery({ onBook }) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null)
  const previewPhotos = workGallery.slice(0, previewLimit)
  const activePhoto = activeIndex === null ? null : workGallery[activeIndex]

  useEffect(() => {
    if (!galleryOpen && !activePhoto) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (activePhoto) setActiveIndex(null)
        else setGalleryOpen(false)
      }
      if (activePhoto && event.key === 'ArrowRight') {
        setActiveIndex((activeIndex + 1) % workGallery.length)
      }
      if (activePhoto && event.key === 'ArrowLeft') {
        setActiveIndex((activeIndex - 1 + workGallery.length) % workGallery.length)
      }
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [galleryOpen, activePhoto, activeIndex])

  const openPhoto = (id) => {
    const index = workGallery.findIndex((item) => item.id === id)
    if (index >= 0) setActiveIndex(index)
  }

  const closeGallery = () => {
    setActiveIndex(null)
    setGalleryOpen(false)
  }

  const bookThisLook = () => {
    closeGallery()
    onBook()
  }

  return (
    <section className="work-gallery-section" id="gallery" aria-labelledby="gallery-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Recent work</p>
            <h2 id="gallery-title">Cuts by Stacy.</h2>
          </div>
          <p>Preview selected work on the home page, then open the full gallery to explore every approved portfolio photo.</p>
        </div>

        <div className="work-gallery-grid work-gallery-preview">
          {previewPhotos.map((item) => (
            <button
              className="work-gallery-card"
              type="button"
              key={item.id}
              onClick={() => openPhoto(item.id)}
              aria-label={`View ${item.caption}`}
            >
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              <span>{item.caption}</span>
            </button>
          ))}
        </div>

        <div className="gallery-section-actions">
          <button className="button" type="button" onClick={() => setGalleryOpen(true)}>
            View All Work{workGallery.length > previewLimit ? ` (${workGallery.length})` : ''}
          </button>
          <button className="button secondary gallery-outline" type="button" onClick={onBook}>Book This Look</button>
        </div>
      </div>

      {galleryOpen && (
        <div className="full-gallery-modal" role="dialog" aria-modal="true" aria-labelledby="full-gallery-title">
          <button className="full-gallery-backdrop" type="button" aria-label="Close full gallery" onClick={closeGallery} />
          <section className="full-gallery-dialog">
            <header>
              <div><p className="eyebrow">Portfolio</p><h2 id="full-gallery-title">All approved work.</h2><span>{workGallery.length} portfolio photos</span></div>
              <button className="full-gallery-close" type="button" aria-label="Close full gallery" onClick={closeGallery}>×</button>
            </header>
            <div className="full-gallery-grid">
              {workGallery.map((item) => (
                <button type="button" key={item.id} onClick={() => openPhoto(item.id)} aria-label={`Open ${item.caption}`}>
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                  <span>{item.caption}</span>
                </button>
              ))}
            </div>
            <footer>
              <span>Select any photo for a larger view.</span>
              <button className="button" type="button" onClick={bookThisLook}>Book This Look</button>
            </footer>
          </section>
        </div>
      )}

      {activePhoto && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={activePhoto.caption}>
          <button className="gallery-lightbox-backdrop" type="button" aria-label="Close photo" onClick={() => setActiveIndex(null)} />
          <div className="gallery-lightbox-dialog">
            <button className="gallery-lightbox-close" type="button" aria-label="Close photo" onClick={() => setActiveIndex(null)}>×</button>
            <button className="gallery-lightbox-nav previous" type="button" aria-label="Previous photo" onClick={() => setActiveIndex((activeIndex - 1 + workGallery.length) % workGallery.length)}>‹</button>
            <img src={activePhoto.src} alt={activePhoto.alt} />
            <button className="gallery-lightbox-nav next" type="button" aria-label="Next photo" onClick={() => setActiveIndex((activeIndex + 1) % workGallery.length)}>›</button>
            <footer><strong>{activePhoto.caption}</strong><button className="button" type="button" onClick={bookThisLook}>Book This Look</button></footer>
          </div>
        </div>
      )}
    </section>
  )
}
