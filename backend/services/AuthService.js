import UserRepository from "../repositories/UserRepository.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

/**
 * AuthService
 * Contains all business logic for authentication flows.
 * Does NOT import or use Express — fully framework-agnostic.
 */
class AuthService {
    async signUp({ fullName, email, password, role }) {
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            throw { status: 400, message: "User already exists." };
        }
        if (!fullName || !email || !password) {
            throw { status: 400, message: "Name, email and password are required." };
        }
        if (password.length < 8) {
            throw { status: 400, message: "Password must be at least 8 characters." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserRepository.create({
            fullName,
            email,
            role: role || "Customer",
            password: hashedPassword
        });

        const token = await generateToken(user._id);
        return { user: user.toObject(), token };
    }

    async signIn({ email, password }) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw { status: 400, message: "User does not exist." };
        }
        if (!user.password) {
            throw { status: 400, message: "This account uses Google sign-in. Please use Google to log in." };
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw { status: 400, message: "Wrong password." };
        }

        const token = await generateToken(user._id);
        return { user: user.toObject(), token };
    }

    async sendOtp({ email }) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw { status: 400, message: "User does not exist." };
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;
        await UserRepository.save(user);
        await sendOtpMail(email, otp);
    }

    async verifyOtp({ email, otp }) {
        const user = await UserRepository.findByEmail(email);
        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            throw { status: 400, message: "invalid/expired otp" };
        }
        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        await UserRepository.save(user);
    }

    async resetPassword({ email, newPassword }) {
        const user = await UserRepository.findByEmail(email);
        if (!user || !user.isOtpVerified) {
            throw { status: 400, message: "otp verification required" };
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.isOtpVerified = false;
        await UserRepository.save(user);
    }

    async googleAuth({ fullName, email, role }) {
        let user = await UserRepository.findByEmail(email);
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await UserRepository.create({
                fullName: fullName || "Google User",
                email,
                role: role || "Customer"
            });
        }

        const token = await generateToken(user._id);
        return { user: { ...user.toObject(), isNewUser }, token };
    }

    async setRole({ userId, role }) {
        if (!role || !["Customer", "HomeCook"].includes(role)) {
            throw { status: 400, message: "Invalid role" };
        }
        const user = await UserRepository.findByIdAndUpdate(userId, { role });
        return user;
    }
}

export default new AuthService();
