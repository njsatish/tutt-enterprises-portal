import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import BarbersPage from './pages/BarbersPage'
import BarberProfilePage from './pages/BarberProfilePage'
import BookPage from './pages/BookPage'
import StandardPage from './pages/StandardPage'
import VisitPage from './pages/VisitPage'
import PrivacyPage from './pages/PrivacyPage'
import NotFoundPage from './pages/NotFoundPage'
import OurWorkPage from './pages/OurWorkPage'
import ReviewsPage from './pages/ReviewsPage'

export default function App(){
 return <BrowserRouter><Routes>
  <Route element={<SiteLayout/>}>
   <Route index element={<HomePage/>}/>
   <Route path="services" element={<ServicesPage/>}/>
   <Route path="barbers" element={<BarbersPage/>}/>
   <Route path="barbers/:slug" element={<BarberProfilePage/>}/>
   <Route path="book" element={<BookPage/>}/>
   <Route path="our-work" element={<OurWorkPage/>}/>
   <Route path="reviews" element={<ReviewsPage/>}/>
   <Route path="our-standard" element={<StandardPage/>}/>
   <Route path="visit" element={<VisitPage/>}/>
   <Route path="privacy" element={<PrivacyPage/>}/>
   <Route path="*" element={<NotFoundPage/>}/>
  </Route>
 </Routes></BrowserRouter>
}
