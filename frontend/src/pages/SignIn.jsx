import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { serverUrl } from "../App";
const SignIn = () => {
  const primaryColor = "#FF7A00";
  const hoverColor = "#E66A00";
  const bgColor = "#FFF8F2";
  const borderColor = "#EADFD8";

  const navigate = useNavigate();

  
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSignIn = async () => {
    try{
      const result = await axios.post(`${serverUrl}/api/auth/signin`,{
        email,password
      },{withCredentials:true})
      console.log(result)
    }
    catch(err){
      console.log(err)

    }
  };

  const handleGoogleAuth = () => {
    console.log("Google auth clicked");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1
          className="text-3xl font-bold mb-2 text-center"
          style={{ color: primaryColor }}
        >
          MaaKhana
        </h1>

        <p className="text-gray-600 mb-8 text-center">
          Sign in to your account and bring home-style food to your door
        </p>

        

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-lg px-3 py-2 focus:outline-none"
            style={{ border: `1px solid ${borderColor}` }}
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        

        {/* Password */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg px-3 py-2 focus:outline-none pr-10"
              style={{ border: `1px solid ${borderColor}` }}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[14px] text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </div>
        <div className='text-right mb-4 cursor-pointer text-[#FF7A00] font-medium' onClick={()=>navigate("/forgot-password")}>
                  Forgot Password
        </div>
        

        <button
          className="w-full font-semibold py-2 rounded-lg bg-[#FF7A00] text-white hover:bg-[#e64323] cursor-pointer"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>

        {err && (
          <p className="text-red-500 text-center my-2">*{err}</p>
        )}

        <button
          type="button"
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 border-gray-400 hover:bg-gray-100 cursor-pointer"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign In with Google</span>
        </button>

        <p
          className="text-center mt-6 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Want to Create a New Account?
          <span className="text-[#FF7A00]"> Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
