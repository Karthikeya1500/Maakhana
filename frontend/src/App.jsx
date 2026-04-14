import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import ForgotPassword from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import useGetCity from './hooks/useGetCity'
import Home from './pages/Home'
import Cart from './pages/Cart'
import MyOrders from './pages/MyOrders'
import Profile from './pages/Profile'
import RegionChefs from './pages/RegionChefs'
import ChefMenu from './pages/ChefMenu'
import AllRegions from './pages/AllRegions'

// Single source of truth — re-export so existing imports still work
export { serverUrl } from './config'

const App = () => {
  useGetCurrentUser()
  useGetCity()
  const { userData, authLoading } = useSelector(state => state.user)
  const location = useLocation()

  // Always show public pages quickly without waiting for auth
  const isPublicPage = location.pathname === '/' || location.pathname === '/regions' || location.pathname.startsWith('/region/') || location.pathname.startsWith('/chef/')

  // ─── Full-screen loader while checking auth ───
  if (authLoading && !isPublicPage) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8f7f6]"
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        <div className="flex flex-col items-center gap-5 animate-pulse">
          {/* Brand Icon */}
          <div className="w-16 h-16 bg-[#f4a462] rounded-2xl flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 10px 30px -5px rgba(244, 164, 98, 0.4)' }}
          >
            <span
              className="material-symbols-outlined text-3xl font-bold"
              style={{ color: '#221810' }}
            >
              restaurant
            </span>
          </div>

          {/* Brand Name */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Maakhana
          </h1>

          {/* Spinner Bar */}
          <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#f4a462] rounded-full"
              style={{
                animation: 'authLoader 1.2s ease-in-out infinite',
              }}
            />
          </div>

          <p className="text-sm text-slate-400 mt-1">Loading your experience…</p>
        </div>

        <style>{`
          @keyframes authLoader {
            0% { width: 0%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div>
      <Routes>
        <Route path='/' element={userData ? <Home /> : <LandingPage />} />
        <Route path='/signup' element={!userData ? <AuthPage initialTab="signup" /> : <Navigate to={"/"} />} />
        <Route path='/signin' element={!userData ? <AuthPage initialTab="login" /> : <Navigate to={"/"} />} />
        <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />

        {/* Protected customer routes */}
        <Route path='/cart' element={userData ? <Cart /> : <Navigate to={"/signin"} />} />
        <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
        <Route path='/profile' element={userData ? <Profile /> : <Navigate to={"/signin"} />} />

        {/* Public routes */}
        <Route path='/regions' element={<AllRegions />} />
        <Route path='/region/:stateName' element={<RegionChefs />} />
        <Route path='/chef/:chefId' element={<ChefMenu />} />
      </Routes>
    </div>
  )
}

export default App

