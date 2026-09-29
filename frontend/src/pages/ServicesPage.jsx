import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { CATEGORY_LABELS, CATEGORY_ORDER, SERVICE_PRESENTATION } from '../config/servicePresentation'
const apiBase=import.meta.env.VITE_API_BASE_URL||''
export default function ServicesPage(){
 const [barbers,setBarbers]=useState([]); const [error,setError]=useState('')
 useEffect(()=>{fetch(`${apiBase}/api/barbers`).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setBarbers(d.barbers||[])).catch(()=>setError('Services are temporarily unavailable.'))},[])
 const categories=useMemo(()=>CATEGORY_ORDER.map(category=>{const families=new Map();barbers.forEach(barber=>(barber.services||[]).forEach(service=>{const p=SERVICE_PRESENTATION[service.id];if(!p||p.category!==category)return;const key=p.family;const item=families.get(key)||{...p,offerings:[]};item.offerings.push({barber,service});families.set(key,item)}));return {category,label:CATEGORY_LABELS[category],families:[...families.values()]}}),[barbers])
 return <><PageHero eyebrow="Confirmed services" title="Built Around Your Best Look"><p>Browse four Booksy service categories, then enter booking with the exact service preselected.</p></PageHero>{error&&<p className="mp-error">{error}</p>}<div className="mp-sections">{categories.map(group=><section key={group.category}><h2>{group.label}</h2><div className="mp-card-grid">{group.families.map(f=><article className="mp-card" key={f.family}><h3>{f.label}</h3><p>{f.offerings.length} {f.offerings.length===1?'barber':'barbers'} available</p><p>{[...new Set(f.offerings.map(x=>x.service.priceLabel))].join(' · ')}</p><Link to={`/book?service=${f.family}`}>Book This Service</Link></article>)}</div></section>)}</div></>
}
