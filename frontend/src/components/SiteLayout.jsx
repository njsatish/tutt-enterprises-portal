import { NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  ['/services', 'Services'],
  ['/barbers', 'Barbers'],
  ['/our-work', 'Our Work'],
  ['/our-standard', 'Our Standard'],
  ['/visit', 'Visit'],
]

export default function SiteLayout() {
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'

  return (
    <div className="mp-site">
      {!isHomePage && (
        <header className="mp-header">
          <NavLink className="mp-brand" to="/">
            <span>✂</span>
            <strong>
              HIGH QUALITY
              <small>BARBERSHOP</small>
            </strong>
          </NavLink>

          <nav aria-label="Primary navigation">
            {nav.map(([to, label]) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
          </nav>

          <NavLink className="mp-book" to="/book">Book Appointment</NavLink>
        </header>
      )}

      <main className="mp-main">
        <Outlet />
      </main>

      {!isHomePage && (
        <footer className="mp-footer">
          <div>
            <strong>Tutt Enterprises LLC</strong>
            <p>4411 W Gate City Blvd, Suite 105, Greensboro, NC 27407</p>
          </div>
          <nav aria-label="Footer navigation">
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/barbers">Barbers</NavLink>
            <NavLink to="/book">Book</NavLink>
            <NavLink to="/reviews">Reviews</NavLink>
            <NavLink to="/privacy">Privacy</NavLink>
          </nav>
        </footer>
      )}
    </div>
  )
}
