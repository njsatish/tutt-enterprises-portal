import PageHero from '../components/PageHero'
import ReviewsList from '../components/ReviewsList'
export default function ReviewsPage(){return <><PageHero eyebrow="Customer reviews" title="Verified Feedback"><p>Published ratings and approved customer feedback connected to the booking experience.</p></PageHero><section className="proof-page"><ReviewsList/></section></>}
