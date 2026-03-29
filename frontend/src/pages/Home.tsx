

export interface IsNscziRMProps {
    id?: string;
}
import React from 'react'
import { useSelector } from 'react-redux'
import Nav from '../components/Nav.jsx'
import Homechef from '../components/Homecook.jsx'
import LandingPage from './LandingPage.jsx'

function Home() {
  const { userData } = useSelector(state => state.user)

  if (!userData) return null

  // HomeCook gets their own full-screen sidebar dashboard (no top Nav)
  if (userData.role === "HomeCook") {
    return <Homechef />
  }

  // Customer: LandingPage now reads userData from Redux directly,
  // so it always shows Nav (cart + profile) when authenticated.
  return <LandingPage />
}

export default Home


export interface IsNscziRMProps {
    id?: string;
}
