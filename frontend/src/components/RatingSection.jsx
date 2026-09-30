const reviewsURL = 'https://booksy.com/en-us/38443_tutt-enterprises-llc_barber-shop_134575_richmond#business-reviews'

const featuredReviews = [
  {
    reviewer: 'Will',
    date: 'Aug 27, 2026',
    service: 'Haircut Only, Ages 5–17',
    review: 'So patient and understanding with my sons. They loved the experience. In their words, “Stacy is the best barber.”',
  },
  {
    reviewer: 'Shaq',
    date: 'May 3, 2026',
    service: 'First-Time Adult Haircut with Facial Hair',
    review: 'Amazing barber, amazing hospitality. Greeted me as soon as I walked in. I’m very particular about my fade and beard, and he cut it exactly as I wanted. I’ll definitely be back.',
  },
  {
    reviewer: 'Timothy',
    date: 'Jan 14, 2026',
    service: 'Haircut with Facial Hair',
    review: 'Just left the shop and wow, everything was top notch. Clean space, awesome vibes, great conversation, killer customer service, and a cut that’s straight fire. 10/10, highly recommend!',
  },
]

export default function RatingSection({ onBook }) {
  return (
    <section className="rating-section" id="reviews" aria-labelledby="rating-title">
      <div className="wrap">
        <div className="rating-layout">
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
            <p>Customer feedback on Booksy reflects a 5.0 overall rating, with 316 five-star reviews.</p>
            <div className="rating-breakdown" aria-label="Booksy rating breakdown">
              <div><strong>316</strong><span>5-star reviews</span></div>
              <div><strong>2</strong><span>4-star reviews</span></div>
              <div><strong>319</strong><span>reviews total</span></div>
            </div>
          </div>
        </div>

        <div className="featured-reviews" aria-label="Featured customer reviews">
          {featuredReviews.map((item) => (
            <article className="review-card" key={`${item.reviewer}-${item.date}`}>
              <div className="review-card-stars" aria-label="5 out of 5 stars">★★★★★</div>
              <blockquote>“{item.review}”</blockquote>
              <footer>
                <strong>{item.reviewer}</strong>
                <span>Confirmed client</span>
                <span>{item.service}</span>
                <time>{item.date}</time>
              </footer>
            </article>
          ))}
        </div>

        <div className="rating-actions rating-actions-centered">
          <button className="button" type="button" onClick={onBook}>Book with Stacy</button>
          <a className="button secondary dark-outline" href={reviewsURL} target="_blank" rel="noreferrer">View All 319 Reviews on Booksy</a>
        </div>
      </div>
    </section>
  )
}
