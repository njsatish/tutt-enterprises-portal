import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ThreeColumnBookingArea from '../ThreeColumnBookingArea'
import PageHero from '../components/PageHero'

export default function BookPage(){
  const [params] = useSearchParams()
  useEffect(()=>{
    const barber=params.get('barber')
    if(barber) window.setTimeout(()=>window.dispatchEvent(new CustomEvent('hq:choose-barber',{detail:{barberSlug:barber}})),50)
  },[params])
  return <><PageHero eyebrow="Live online booking" title="Book Your Appointment"><p>Choose a service, barber, live date, and time. Complete the appointment in the same-page Booksy widget.</p></PageHero><ThreeColumnBookingArea /></>
}
