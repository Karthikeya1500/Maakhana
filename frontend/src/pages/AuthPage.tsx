

export interface IBUlRBHWGProps {
    id?: string;
}
import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const AuthPage = ({ initialTab = "login" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Tab State ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(initialTab);

  // ─── Sign In State ──────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  // ─── Sign Up State ──────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [role, setRole] = useState("Customer");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupErr, setSignupErr] = useState("");

  // ─── Google Role Selection Modal State ─────────────────────
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ─── Sign In Handler ───────────────────────────────────────
  const handleSignIn = async () => {
    setLoginErr("");
    if (!loginEmail || !loginPassword) {
      return setLoginErr("Please fill in all fields.");
    }
    setLoginLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email: loginEmail, password: loginPassword },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoginErr(error?.response?.data?.message || "Sign in failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Google Sign In Handler ─────────────────────────────────
  const handleSignInGoogle = async () => {
    setLoginErr("");
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
        },
        { withCredentials: true }
      );
      if (data.isNewUser) {
        // New user — show role selection modal
        setGoogleUserData(data);
        setShowRoleModal(true);
      } else {
        // Existing user — go straight home
        dispatch(setUserData(data));
        navigate("/");
      }
    } catch (error) {
      console.log("Google sign in error:", error);
      setLoginErr(error?.response?.data?.message || error?.message || "Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  };


  // ─── Sign Up Handler ───────────────────────────────────────
  const handleSignUp = async () => {
    setSignupErr("");
    if (!fullName || !signupEmail || !signupPassword) {
      return setSignupErr("Please fill in all fields.");
    }
    setSignupLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email: signupEmail, password: signupPassword, role },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      navigate("/");
    } catch (error) {
      console.error("Sign up failed:", error);
      const errMsg = error.response?.data?.message || error.message || "Sign up failed. Please try again.";
      setSignupErr(errMsg);
    } finally {
      setSignupLoading(false);
    }
  };

  // ─── Google Sign Up Handler ─────────────────────────────────
  const handleSignUpGoogle = async () => {
    setSignupErr("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
        },
        { withCredentials: true }
      );
      if (data.isNewUser) {
        // New user — show role selection modal (even on signup tab, so they confirm)
        setGoogleUserData(data);
        setSelectedRole(role);
        setShowRoleModal(true);
      } else {
        // Existing user — go straight home
        dispatch(setUserData(data));
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      setSignupErr(error?.response?.data?.message || "Google sign up failed");
    }
  };

  // ─── Role Confirm Handler (after Google auth) ──────────────
  const handleRoleConfirm = async () => {
    if (!selectedRole) return;
    setRoleLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/set-role`,
        { role: selectedRole },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      setShowRoleModal(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setRoleLoading(false);
    }
  };

  // ─── Google SVG Icon ────────────────────────────────────────
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  if (googleLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f7f6]">
        <div className="flex flex-col items-center gap-5 animate-pulse">
          <div className="w-16 h-16 bg-[#f4a462] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-3xl font-bold" style={{ color: '#221810' }}>restaurant</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maakhana</h1>
          <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#f4a462] rounded-full" style={{ animation: 'authLoader 1.2s ease-in-out infinite' }} />
          </div>
          <p className="text-sm text-slate-400 mt-1">Signing you in…</p>
        </div>
        <style>{`
          @keyframes authLoader {
            0% { width: 0%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* ═══════════ LEFT SIDE: Visual Experience ═══════════ */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 24, 16, 0.6), rgba(34, 24, 16, 0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDy-3hdGjQDg4MXj2Dn53qLB5b28U3G-__O_i0fUzJ0Md7lzU13O5HUuAr_K1dl3Ql9vai-llWrpKMcFm0tHmBuHV3bR4WDbwOUjo-Ko_sA9dB_UpmfgfPL4a4yndHgZSWWtvzQlTsSiWxhYzh9Z3wzGDzzYcZGtGBgYMxGt-MZQh7lPGhqtjdS9atc3uz1m944ZdQ9vxmHdfj6VglEoSiebKxmNlG6_zOl4b3qnx6dAfVPG93bE4Z87e0fU9TEm-1PoZeprMZzpM0')`,
        }}
      >
        {/* Logo */}
        <div className="z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-[#f4a462] rounded-lg flex items-center justify-center">
              <span
                className="material-symbols-outlined font-bold"
                style={{ color: "#221810" }}
              >
                restaurant
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Maakhana</h1>
          </div>
        </div>

        {/* Hero Text */}
        <div className="z-10 max-w-md">
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            The Taste of Home, delivered to your door.
          </h2>
          <p className="text-white/90 text-lg leading-relaxed">
            Experience authentic Indian home-cooked flavors made with love and
            the finest ingredients. Join our community of food lovers today.
          </p>
        </div>

        {/* Social Proof */}
        <div className="z-10 flex gap-4 items-center">
          <div className="flex -space-x-3">
            <img
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
              alt="User 1"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjzowvqjmJ0WI1o2ACWQd6ks1QQTdlTVChwx0TQ_NKWQ8bo8Cx-OBidbJwQapRtLvorTqlHT5E-tC1kxsrUypF-mm4-J2XkVbkIfViTPMF8qmr296pSneFYhwjqTtxZ1Ds05Fdaf20FtltrRUpX8pEJf8t2oul_GchT2NntbSABXFdPDS0LLG2bp4ySmPxrIYfed6eQfmCOKbJ_ZOhqy74dxOSaZ8EUQcHcNhiboDKEvK-Jq3hCfxpoAl2zK8J-PPNPuPiKx2Lgr0"
            />
            <img
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
              alt="User 2"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuHn21NnEVp406qW9Tcb726nKVoKyiL6c5k2yfdEgsjmp-pMdhjGKrYOL4u_KcS5y7XXTXwcqWsfgy9gGsey6u6zckAxNASoW0POHWc558Jon5DfoS8ULWc6-UepUPf4IxUgfTEcRDi6ZLQD5d7WjmQnG8W09zNeeHt3Vo4-Z8NFxgYMbMMKuPvSxLHeHCeVHka32wo-PuyX09uaO8khYCttk9_LG-a5yBwfb46sbII-XrjBHA2jEXWs0QKAxRmfzP6Lz-Jo52w7c"
            />
            <img
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
              alt="User 3"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8uA71UvWimN4ueVk16Lq74nCzOs9Hm0fzA1BJJ_WYtA2-tJsXuBrCflbxEA2mngAH0CrWaAPEZ86m1r7feW0RUlqYXivdCVFtR9iH4t-V7j99hTI9jMZaA7-DSCbnteIjxS6t0rcoCxKjcd7sivwEhJ9F5z95J_B4-E8aMGDOP7h5mljH7VM5IwtDLUa0V8FdejfsUMqdhRKRje3uL1amxMTimHiZAe2xOkQjc90MXKdayvtwOoOES80W8ZsENHaSTmwQiKzvL0o"
            />
          </div>
          <p className="text-white/80 text-sm">
            Joined by 10k+ food enthusiasts
          </p>
        </div>

        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')",
          }}
        />
      </div>

      {/* ═══════════ RIGHT SIDE: Auth Forms ═══════════ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 bg-[#f8f7f6] overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Logo for Mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 bg-[#f4a462] rounded-lg flex items-center justify-center">
              <span
                className="material-symbols-outlined font-bold text-lg"
                style={{ color: "#221810" }}
              >
                restaurant
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Maakhana
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-white p-8 rounded-xl shadow-xl border border-[#f4a462]/10" style={{ boxShadow: '0 25px 50px -12px rgba(244, 164, 98, 0.05), 0 0 0 1px rgba(244, 164, 98, 0.05)' }}>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-8">
              <button
                className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "login"
                  ? "border-[#f4a462] text-slate-900"
                  : "border-transparent text-slate-400 hover:text-[#f4a462]"
                  }`}
                onClick={() => {
                  setActiveTab("login");
                  setLoginErr("");
                }}
              >
                Login
              </button>
              <button
                className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "signup"
                  ? "border-[#f4a462] text-slate-900"
                  : "border-transparent text-slate-400 hover:text-[#f4a462]"
                  }`}
                onClick={() => {
                  setActiveTab("signup");
                  setSignupErr("");
                }}
              >
                Sign Up
              </button>
            </div>

            {/* ─────── LOGIN FORM ─────── */}
            {activeTab === "login" && (
              <div className="animate-fadeIn">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-slate-500">
                    Please enter your details to sign in.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Email
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f4a462] transition-colors text-xl">
                        alternate_email
                      </span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-[#f8f7f6] border border-transparent focus:border-[#f4a462] focus:ring-1 focus:ring-[#f4a462] rounded-lg transition-all text-slate-900 outline-none"
                        placeholder="name@example.com"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        className="text-xs font-bold text-[#f4a462] hover:underline cursor-pointer"
                        onClick={() => navigate("/forgot-password")}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f4a462] transition-colors text-xl">
                        lock
                      </span>
                      <input
                        className="w-full pl-12 pr-12 py-3.5 bg-[#f8f7f6] border border-transparent focus:border-[#f4a462] focus:ring-1 focus:ring-[#f4a462] rounded-lg transition-all text-slate-900 outline-none"
                        placeholder="••••••••"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        onClick={() => setShowLoginPassword((p) => !p)}
                        type="button"
                      >
                        {showLoginPassword ? (
                          <FaRegEyeSlash size={18} />
                        ) : (
                          <FaRegEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {loginErr && (
                    <p className="text-red-500 text-center text-sm">
                      *{loginErr}
                    </p>
                  )}

                  {/* Sign In Button */}
                  <button
                    className="w-full py-4 bg-[#f4a462] text-[#221810] font-bold rounded-lg shadow-lg hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    style={{ boxShadow: "0 10px 25px -5px rgba(244, 164, 98, 0.3)" }}
                    onClick={handleSignIn}
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <ClipLoader size={20} color="#221810" />
                    ) : (
                      <>
                        Sign In
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400 font-medium tracking-widest">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <button
                    className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    onClick={handleSignInGoogle}
                    type="button"
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <ClipLoader size={20} color="#221810" />
                    ) : (
                      <>
                        <GoogleIcon />
                        Google
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ─────── SIGNUP FORM ─────── */}
            {activeTab === "signup" && (
              <div className="animate-fadeIn">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-slate-500">
                    Join us and bring home-style food to your door.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f4a462] transition-colors text-xl">
                        person
                      </span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-[#f8f7f6] border border-transparent focus:border-[#f4a462] focus:ring-1 focus:ring-[#f4a462] rounded-lg transition-all text-slate-900 outline-none"
                        placeholder="Enter your full name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Email
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f4a462] transition-colors text-xl">
                        alternate_email
                      </span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-[#f8f7f6] border border-transparent focus:border-[#f4a462] focus:ring-1 focus:ring-[#f4a462] rounded-lg transition-all text-slate-900 outline-none"
                        placeholder="name@example.com"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Password
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f4a462] transition-colors text-xl">
                        lock
                      </span>
                      <input
                        className="w-full pl-12 pr-12 py-3.5 bg-[#f8f7f6] border border-transparent focus:border-[#f4a462] focus:ring-1 focus:ring-[#f4a462] rounded-lg transition-all text-slate-900 outline-none"
                        placeholder="••••••••"
                        type={showSignupPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        onClick={() => setShowSignupPassword((p) => !p)}
                        type="button"
                      >
                        {showSignupPassword ? (
                          <FaRegEyeSlash size={18} />
                        ) : (
                          <FaRegEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      I am a
                    </label>
                    <div className="flex gap-2">
                      {["Customer", "HomeCook"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`flex-1 rounded-lg px-3 py-2.5 font-medium transition-all cursor-pointer text-sm ${role === r
                            ? "bg-[#f4a462] text-[#221810] shadow-md"
                            : "bg-[#f8f7f6] text-slate-600 hover:bg-[#f4a462]/10 hover:text-[#f4a462]"
                            }`}
                          onClick={() => setRole(r)}
                          style={
                            role === r
                              ? { boxShadow: "0 4px 12px rgba(244, 164, 98, 0.3)" }
                              : {}
                          }
                        >
                          {r === "HomeCook" ? "Home Cook" : r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {signupErr && (
                    <p className="text-red-500 text-center text-sm">
                      *{signupErr}
                    </p>
                  )}

                  {/* Sign Up Button */}
                  <button
                    className="w-full py-4 bg-[#f4a462] text-[#221810] font-bold rounded-lg shadow-lg hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    style={{ boxShadow: "0 10px 25px -5px rgba(244, 164, 98, 0.3)" }}
                    onClick={handleSignUp}
                    disabled={signupLoading}
                  >
                    {signupLoading ? (
                      <ClipLoader size={20} color="#221810" />
                    ) : (
                      <>
                        Create Account
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400 font-medium tracking-widest">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Sign Up */}
                  <button
                    className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    onClick={handleSignUpGoogle}
                    type="button"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-slate-500">
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  className="text-[#f4a462] font-bold hover:underline cursor-pointer"
                  onClick={() => {
                    setActiveTab("signup");
                    setLoginErr("");
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-[#f4a462] font-bold hover:underline cursor-pointer"
                  onClick={() => {
                    setActiveTab("login");
                    setSignupErr("");
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </p>

          {/* Help/Privacy Links */}
          <div className="flex justify-center gap-6 pt-4 border-t border-slate-200">
            <a className="text-xs text-slate-400 hover:text-[#f4a462] transition-colors uppercase tracking-wider font-semibold" href="#">
              Terms
            </a>
            <a className="text-xs text-slate-400 hover:text-[#f4a462] transition-colors uppercase tracking-wider font-semibold" href="#">
              Privacy
            </a>
            <a className="text-xs text-slate-400 hover:text-[#f4a462] transition-colors uppercase tracking-wider font-semibold" href="#">
              Help
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════ ROLE SELECTION MODAL ═══════════ */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#f4a462]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-[#f4a462]">waving_hand</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome, {googleUserData?.fullName?.split(' ')[0]}!
              </h3>
              <p className="text-slate-500 text-sm">How would you like to use Maakhana?</p>
            </div>

            {/* Role Cards */}
            <div className="space-y-3 mb-8">
              {/* Customer Card */}
              <button
                onClick={() => setSelectedRole("Customer")}
                className={`w-full p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedRole === "Customer"
                  ? "border-[#f4a462] bg-[#f4a462]/5 shadow-md"
                  : "border-slate-200 hover:border-[#f4a462]/40 hover:bg-[#f4a462]/5"
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedRole === "Customer" ? "bg-[#f4a462] text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-bold text-slate-900">I'm a Customer</h4>
                  <p className="text-xs text-slate-500">Order authentic home-cooked meals from local chefs</p>
                </div>
                {selectedRole === "Customer" && (
                  <span className="material-symbols-outlined text-[#f4a462]">check_circle</span>
                )}
              </button>

              {/* HomeCook Card */}
              <button
                onClick={() => setSelectedRole("HomeCook")}
                className={`w-full p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedRole === "HomeCook"
                  ? "border-[#f4a462] bg-[#f4a462]/5 shadow-md"
                  : "border-slate-200 hover:border-[#f4a462]/40 hover:bg-[#f4a462]/5"
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedRole === "HomeCook" ? "bg-[#f4a462] text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-bold text-slate-900">I'm a Home Cook</h4>
                  <p className="text-xs text-slate-500">Share your recipes and serve home-cooked food</p>
                </div>
                {selectedRole === "HomeCook" && (
                  <span className="material-symbols-outlined text-[#f4a462]">check_circle</span>
                )}
              </button>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleRoleConfirm}
              disabled={!selectedRole || roleLoading}
              className="w-full py-4 bg-[#f4a462] text-[#221810] font-bold rounded-xl shadow-lg hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 10px 25px -5px rgba(244, 164, 98, 0.3)" }}
            >
              {roleLoading ? (
                <ClipLoader size={20} color="#221810" />
              ) : (
                <>
                  Continue
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Inline styles for animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;


export interface IBUlRBHWGProps {
    id?: string;
}
