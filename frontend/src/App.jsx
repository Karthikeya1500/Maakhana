import React from 'react'
import {Route, Routes} from 'react-router-dom'
import SignUp from './pages/signup'
import SignIn from './pages/signin'
import ForgotPassword from './pages/forgotpassword'
export const serverUrl = "http://localhost:8000"

const App = () => {
  return (
    <div>
      <Routes>
        <Route path ="/signup" element={<SignUp/>}/>
        <Route path ="/signin" element={<SignIn/>}/>
        <Route path ="/forgotpassword" element = {<ForgotPassword/>}/>
      </Routes>
    </div>
  )
}

export default App
