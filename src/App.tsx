import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { isConfigured } from './lib/supabase'
import { LeaderboardsPage } from './features/leaderboards'
import { PigeonProfilePage } from './features/pigeons'
import { BillionairesPage } from './features/wealth'
import { LandingPage } from './pages/LandingPage'
import { MyWishesPage } from './pages/MyWishesPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RevealPage } from './pages/RevealPage'
import { WallPage } from './pages/WallPage'
import { WishPage } from './pages/WishPage'

function SetupNotice() {
  return (
    <div className="card space-y-2">
      <h1 className="text-xl font-bold">⛲ The well needs plumbing</h1>
      <p>
        Copy <code>.env.example</code> to <code>.env</code> and set <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code>, then run the SQL files in <code>supabase/migrations/</code> in order.
        The README has the full steps.
      </p>
    </div>
  )
}

/** Pages that talk to Supabase need it configured; the landing page and 404 don't. */
function RequireConfig() {
  return isConfigured ? <Outlet /> : <SetupNotice />
}

export default function App() {
  return (
    <>
      <div className="glitter" aria-hidden />
      <BrowserRouter>
        <Routes>
          <Route index element={<LandingPage />} />
          <Route element={<Layout />}>
            <Route element={<RequireConfig />}>
              <Route path="wall" element={<WallPage />} />
              <Route path="wish/:id" element={<WishPage />} />
              <Route path="wish/:id/reveal/:giftId" element={<RevealPage />} />
              <Route path="mine" element={<MyWishesPage />} />
              <Route path="leaderboards" element={<LeaderboardsPage />} />
              <Route path="billionaires" element={<BillionairesPage />} />
              <Route path="pigeons/wisher/:name" element={<PigeonProfilePage />} />
              <Route path="pigeons/wish/:wishId" element={<PigeonProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
