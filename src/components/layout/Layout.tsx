import { Link, NavLink, Outlet } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

const NAV: [string, string][] = [
  ['/wall', 'Wall'],
  ['/leaderboards', 'Leaderboards'],
  ['/billionaires', 'Rich List'],
  ['/mine', 'My wishes'],
]

export function Layout() {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4">
      <div className="mt-3 rounded-xl border border-gold-500/30 bg-gold-400/10 px-3 py-2 text-center text-xs text-gold-300">
        Nothing here is real. No money, no gifts, no Kevin. 🎭
      </div>
      <header className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="gold-text whitespace-nowrap font-title text-lg font-black sm:text-2xl">
          The Wishing Well
        </Link>
        <nav className="flex flex-wrap gap-1.5 text-sm" aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `btn whitespace-nowrap ${isActive ? 'bg-gold-400/25' : 'bg-gold-400/5'} !px-3 !py-1.5`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
