import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
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
  const { userData } = useSelector(state => state.user)
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
