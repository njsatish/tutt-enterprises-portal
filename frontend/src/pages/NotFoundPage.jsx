import { Link } from 'react-router-dom'
export default function NotFoundPage(){return <div className="mp-empty"><p>404</p><h1>Page Not Found</h1><div className="mp-actions"><Link to="/">Return Home</Link><Link to="/book">Book Appointment</Link><Link to="/barbers">View Barbers</Link></div></div>}
