import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
const apiBase=import.meta.env.VITE_API_BASE_URL||''
export default function BarbersPage(){
 const [barbers,setBarbers]=useState([]); const [error,setError]=useState('')
 useEffect(()=>{fetch(`${apiBase}/api/barbers`).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setBarbers(d.barbers||[])).catch(()=>setError('The team directory is temporarily unavailable.'))},[])
 return <><PageHero eyebrow="Meet the team" title="Choose Your Barber"><p>View services or start a barber-first live booking.</p></PageHero>{error&&<p className="mp-error">{error}</p>}<div className="mp-card-grid mp-barber-grid">{barbers.map(b=><article className="mp-card" key={b.slug}>{b.photoUrl&&<img src={b.photoUrl} alt=""/>}<h2>{b.name}</h2><p>{b.businessName}</p><p>{b.services?.length||0} configured services</p><div className="mp-actions"><Link to={`/barbers/${b.slug}`}>View Profile</Link><Link to={`/book?barber=${b.slug}`}>Book with {b.name}</Link></div></article>)}</div></>
}
