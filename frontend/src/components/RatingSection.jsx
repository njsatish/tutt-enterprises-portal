const reviewsURL = 'https://booksy.com/en-us/38443_tutt-enterprises-llc_barber-shop_134575_richmond#business-reviews'

export default function RatingSection({ onBook }) {
  return (
    <section className="rating-section" id="reviews" aria-labelledby="rating-title">
      <div className="wrap rating-layout">
        <div className="rating-score-card">
          <p className="eyebrow">Verified on Booksy</p>
          <div className="rating-score-row">
            <strong className="rating-score" aria-label="5.0 out of 5 stars">5.0</strong>
            <div><div className="rating-stars" aria-hidden="true">★★★★★</div><span>319 customer reviews</span></div>
          </div>
          <a href={reviewsURL} target="_blank" rel="noreferrer">Read all reviews on Booksy</a>
        </div>

        <div className="rating-copy">
          <p className="eyebrow">Loved by Richmond</p>
          <h2 id="rating-title">Trusted for consistent, detailed work.</h2>
          <p>Customer feedback on Booksy reflects a 5.0 overall rating, with 316 five-star reviews. Visit Booksy to read the original customer feedback.</p>
          <div className="rating-breakdown" aria-label="Booksy rating breakdown">
            <div><strong>316</strong><span>5-star reviews</span></div>
            <div><strong>2</strong><span>4-star reviews</span></div>
            <div><strong>319</strong><span>reviews total</span></div>
          </div>
          <div className="rating-actions">
            <button className="button" type="button" onClick={onBook}>Book with Stacy</button>
            <a className="button secondary dark-outline" href={reviewsURL} target="_blank" rel="noreferrer">View Booksy Reviews</a>
          </div>
        </div>
      </div>
    </section>
  )
}
