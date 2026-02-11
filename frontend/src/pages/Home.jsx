import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/userDashboard.jsx'
import Homechef from '../components/Homecook.jsx'
import DeliveryBoy from '../components/DeliveryBoy.jsx'

function Home() {
    const {userData}=useSelector(state=>state.user)
  return (
    <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f6]'>
      {userData.role=="Customer" && <UserDashboard/>}
      {userData.role=="HomeCook" && <Homechef/>}
      {userData.role=="DeliveryBoy" && <DeliveryBoy/>}
    </div>
  )
}

export default Home
