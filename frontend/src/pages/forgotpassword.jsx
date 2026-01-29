import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';

const ForgotPassword = () => {
  const primaryColor = "#FF7A00";
  const hoverColor = "#E66A00";
  const bgColor = "#FFF8F2";
  const borderColor = "#EADFD8";

  const [step, setStep] = useState(1)
  const [email,setEmail]=useState("")
  const [otp,setOtp]=useState("")
  const [newPassword,setNewPassword]=useState("")
  const [confirmPassword,setConfirmPassword]=useState("")
  const [err,setErr]=useState("")
  const navigate=useNavigate()
  const [loading,setLoading]=useState(false)

  const handleSendOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/send-otp`,{email},{withCredentials:true})
      console.log(result)
      setErr("")
      setStep(2)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  }

  const handleVerifyOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/verify-otp`,{email,otp},{withCredentials:true})
      console.log(result)
      setErr("")
      setStep(3)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  }

  const handleResetPassword=async () => {
    if(newPassword!=confirmPassword){
      return null
    }
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/reset-password`,{email,newPassword},{withCredentials:true})
      console.log(result)
      setErr("")
      setLoading(false)
      navigate("/signin")
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  }

  return (
    <div
      className='flex w-full items-center justify-center min-h-screen p-4'
      style={{ backgroundColor: bgColor }}
    >
      <div
        className='bg-white rounded-xl shadow-lg w-full max-w-md p-8'
        style={{ border: `1px solid ${borderColor}` }}
      >
        <div className='flex items-center gap-4 mb-4'>
          <IoIosArrowRoundBack
            size={30}
            style={{ color: primaryColor }}
            className='cursor-pointer'
            onClick={()=>navigate("/signin")}
          />
          <h1
            className='text-2xl font-bold text-center'
            style={{ color: primaryColor }}
          >
            Forgot Password
          </h1>
        </div>

        {step == 1 && (
          <div>
            <div className='mb-6'>
              <label className='block text-gray-700 font-medium mb-1'>Email</label>
              <input
                type="email"
                className='w-full rounded-lg px-3 py-2 focus:outline-none'
                style={{ border: `1px solid ${borderColor}` }}
                placeholder='Enter your Email'
                onChange={(e)=>setEmail(e.target.value)}
                value={email}
              />
            </div>

            <button
              className='w-full font-semibold py-2 rounded-lg text-white transition'
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e)=>e.currentTarget.style.backgroundColor=hoverColor}
              onMouseLeave={(e)=>e.currentTarget.style.backgroundColor=primaryColor}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white'/> : "Send Otp"}
            </button>

            {err && <p className='text-red-500 text-center my-2'>*{err}</p>}
          </div>
        )}

        {step == 2 && (
          <div>
            <div className='mb-6'>
              <label className='block text-gray-700 font-medium mb-1'>OTP</label>
              <input
                type="text"
                className='w-full rounded-lg px-3 py-2 focus:outline-none'
                style={{ border: `1px solid ${borderColor}` }}
                placeholder='Enter OTP'
                onChange={(e)=>setOtp(e.target.value)}
                value={otp}
              />
            </div>

            <button
              className='w-full font-semibold py-2 rounded-lg text-white transition'
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e)=>e.currentTarget.style.backgroundColor=hoverColor}
              onMouseLeave={(e)=>e.currentTarget.style.backgroundColor=primaryColor}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white'/> : "Verify"}
            </button>

            {err && <p className='text-red-500 text-center my-2'>*{err}</p>}
          </div>
        )}

        {step == 3 && (
          <div>
            <div className='mb-6'>
              <label className='block text-gray-700 font-medium mb-1'>New Password</label>
              <input
                type="password"
                className='w-full rounded-lg px-3 py-2 focus:outline-none'
                style={{ border: `1px solid ${borderColor}` }}
                placeholder='Enter New Password'
                onChange={(e)=>setNewPassword(e.target.value)}
                value={newPassword}
              />
            </div>

            <div className='mb-6'>
              <label className='block text-gray-700 font-medium mb-1'>Confirm Password</label>
              <input
                type="password"
                className='w-full rounded-lg px-3 py-2 focus:outline-none'
                style={{ border: `1px solid ${borderColor}` }}
                placeholder='Confirm Password'
                onChange={(e)=>setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </div>

            <button
              className='w-full font-semibold py-2 rounded-lg text-white transition'
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e)=>e.currentTarget.style.backgroundColor=hoverColor}
              onMouseLeave={(e)=>e.currentTarget.style.backgroundColor=primaryColor}
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white'/> : "Reset Password"}
            </button>

            {err && <p className='text-red-500 text-center my-2'>*{err}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword;
