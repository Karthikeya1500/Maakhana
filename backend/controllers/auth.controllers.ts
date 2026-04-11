

export type TVMffayzY = string | number;
import AuthService from "../services/AuthService";

const isProduction = process.env.NODE_ENV === "production" || (process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith("https"));

const cookieOptions = {
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    httpOnly: true
};

class AuthController {
    async signUp(req, res) {
        try {
            const { user, token } = await AuthService.signUp(req.body);
            res.cookie("token", token, { ...cookieOptions, maxAge: 9 * 24 * 60 * 60 * 1000 });
            return res.status(201).json(user);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            console.error("Sign up error:", error);
            return res.status(500).json({ message: error.message || "An error occurred during sign up." });
        }
    }

    async signIn(req, res) {
        try {
            const { user, token } = await AuthService.signIn(req.body);
            res.cookie("token", token, { ...cookieOptions, maxAge: 9 * 24 * 60 * 60 * 1000 });
            return res.status(200).json(user);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            console.error("Sign in error:", error);
            return res.status(500).json({ message: error.message || "An error occurred during sign in." });
        }
    }

    async signOut(req, res) {
        try {
            res.clearCookie("token", cookieOptions);
            return res.status(200).json({ message: "log out successfully" });
        } catch (error) {
            return res.status(500).json({ message: `Sign out error: ${error}` });
        }
    }

    async sendOtp(req, res) {
        try {
            await AuthService.sendOtp(req.body);
            return res.status(200).json({ message: "otp sent successfully" });
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Send OTP error: ${error}` });
        }
    }

    async verifyOtp(req, res) {
        try {
            await AuthService.verifyOtp(req.body);
            return res.status(200).json({ message: "otp verify successfully" });
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Verify OTP error: ${error}` });
        }
    }

    async resetPassword(req, res) {
        try {
            await AuthService.resetPassword(req.body);
            return res.status(200).json({ message: "password reset successfully" });
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Reset password error: ${error}` });
        }
    }

    async googleAuth(req, res) {
        try {
            const { user, token } = await AuthService.googleAuth(req.body);
            res.cookie("token", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: `Google auth error: ${error}` });
        }
    }

    async setRole(req, res) {
        try {
            const user = await AuthService.setRole({ userId: req.userId, role: req.body.role });
            return res.status(200).json(user);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Set role error: ${error}` });
        }
    }
}

export default new AuthController();


export type TVMffayzY = string | number;
