import { Link } from 'react-router-dom'
import WorkGallery from './WorkGallery'
import ReviewsList from './ReviewsList'
export default function HomeProofSections(){return <>
  <section className="home-proof-section"><div className="proof-heading"><p>Our work</p><h2>Cuts Built With Precision</h2><Link to="/our-work">View All Work</Link></div><WorkGallery limit={6} compact/></section>
  <section className="home-proof-section home-review-section"><div className="proof-heading"><p>Customer reviews</p><h2>Verified Feedback</h2><Link to="/reviews">Read More Reviews</Link></div><ReviewsList limit={3}/></section>
</>}
