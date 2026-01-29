import express from "express"
import { sendOtp,verifyOtp,resetPassword,signIn,signOut,signUp } from "../controllers/auth.controllers.js"
const authRouter = express.Router()
authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.get("/signout",signOut)
authRouter.post("/send-otp",sendOtp)
authRouter.post("/verify-otp",verifyOtp)
authRouter.post("/reset-password",resetPassword)



export default authRouter