import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genarateToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists." })
        }
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required." })
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        user = await User.create({
            fullName,
            email,
            role: role || "Customer",
            password: hashedPassword
        })

        const token = await genarateToken(user._id)
        const isProduction = process.env.NODE_ENV === "production"
        res.cookie("token", token, {
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
            maxAge: 9 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(201).json(user.toObject())

    } catch (error) {
        console.error("Sign up error:", error);
        return res.status(500).json({ message: error.message || "An error occurred during sign up." })
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }
        if (!user.password) {
            return res.status(400).json({ message: "This account uses Google sign-in. Please use Google to log in." })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(400).json({ message: "Wrong password." })
        }

        const token = await genarateToken(user._id)
        const isProduction = process.env.NODE_ENV === "production"
        res.cookie("token", token, {
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
            maxAge: 9 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(200).json(user.toObject())

    } catch (error) {
        console.error("Sign in error:", error);
        return res.status(500).json({ message: error.message || "An error occurred during sign in." })
    }
}

export const signOut = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production"
        res.clearCookie("token", {
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
            httpOnly: true
        })
        return res.status(200).json({ message: "log out successfully" })

    }
    catch (error) {
        return res.status(500).json({ message: `Sign out error: ${error}` })

    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        user.resetOtp = otp
        user.otpExpires = Date.now() + 5 * 60 * 1000
        user.isOtpVerified = false
        await user.save()
        await sendOtpMail(email, otp)
        return res.status(200).json({ message: "otp sent successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Send OTP error: ${error}` })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })
        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "invalid/expired otp" })
        }
        user.isOtpVerified = true
        user.resetOtp = undefined
        user.otpExpires = undefined
        await user.save()
        return res.status(200).json({ message: "otp verify successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Verify OTP error: ${error}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "password reset successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Reset password error: ${error}` })
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, role } = req.body
        let user = await User.findOne({ email })
        let isNewUser = false

        if (!user) {
            isNewUser = true
            user = await User.create({
                fullName: fullName || "Google User",
                email,
                role: role || "Customer"
            })
        }

        const token = await genarateToken(user._id)
        const isProduction = process.env.NODE_ENV === "production"
        res.cookie("token", token, {
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(200).json({ ...user.toObject(), isNewUser })

    } catch (error) {
        return res.status(500).json({ message: `Google auth error: ${error}` })
    }
}

export const setRole = async (req, res) => {
    try {
        const { role } = req.body
        if (!role || !["Customer", "HomeCook"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" })
        }
        const user = await User.findByIdAndUpdate(
            req.userId,
            { role },
            { new: true }
        )
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Set role error: ${error}` })
    }
}
