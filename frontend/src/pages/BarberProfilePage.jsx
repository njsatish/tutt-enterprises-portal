import { useEffect,useState } from 'react'
import { Link,useParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
const apiBase=import.meta.env.VITE_API_BASE_URL||''
export default function BarberProfilePage(){
 const {slug}=useParams(); const [barber,setBarber]=useState(null); const [error,setError]=useState('')
 useEffect(()=>{fetch(`${apiBase}/api/barbers/${slug}`).then(r=>{if(!r.ok)throw Error();return r.json()}).then(setBarber).catch(()=>setError('Barber profile not found.'))},[slug])
 if(error)return <div className="mp-empty"><h1>{error}</h1><Link to="/barbers">View All Barbers</Link></div>
 if(!barber)return <p className="mp-loading">Loading profile…</p>
 return <><PageHero eyebrow={barber.businessName} title={barber.name}><p>View confirmed services and schedule live availability.</p><Link className="mp-primary" to={`/book?barber=${barber.slug}`}>Book with {barber.name}</Link></PageHero><section className="mp-profile">{barber.photoUrl&&<img src={barber.photoUrl} alt=""/>}<div><h2>Services</h2><div className="mp-card-grid">{(barber.services||[]).map(s=><article className="mp-card" key={s.id}><h3>{s.name}</h3><p>{s.description}</p><p>{s.priceLabel} · {s.durationMinutes} min</p><Link to={`/book?barber=${barber.slug}&service=${s.slug}`}>Check Availability</Link></article>)}</div></div></section></>
}
