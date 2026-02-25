import express from "express"
import { googleAuth, sendOtp, verifyOtp, resetPassword, signIn, signOut, signUp, setRole } from "../controllers/auth.controllers.js"
import isAuth from "../middlewares/isAuth.js"

const authRouter = express.Router()
authRouter.post("/signup", signUp)
authRouter.post("/signin", signIn)
authRouter.get("/signout", signOut)
authRouter.post("/send-otp", sendOtp)
authRouter.post("/verify-otp", verifyOtp)
authRouter.post("/reset-password", resetPassword)
authRouter.post("/google-auth", googleAuth)
authRouter.post("/set-role", isAuth, setRole)

export default authRouter