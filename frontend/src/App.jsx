import React from 'react'
import {Route, Routes} from 'react-router-dom'
import SignUp from './pages/signup'
import SignIn from './pages/signin'


const App = () => {
  return (
    <div>
      <Routes>
        <Route path ="/signup" element={<SignUp/>}/>
        <Route path ="/signin" element={<SignIn/>}/>
      </Routes>
    </div>
  )
}

export default App
