import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/signup'
import SignIn from './pages/signin'
import ForgotPassword from './pages/forgotpassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import useGetCity from './hooks/useGetCity'
export const serverUrl = "http://localhost:8000"

const App = () => {
  useGetCurrentUser()
  useGetCity()
  const {userData} = useSelector(state=>state.user)
  return (
    <div>
      <Routes>
    <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
    <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
    <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
    <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>}/>
      </Routes>
    </div>
  )
}

export default App
