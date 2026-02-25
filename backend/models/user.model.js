import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    label: { type: String, default: "Home" },       // Home, Work, Other
    fullAddress: { type: String, required: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    phone: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
}, { _id: true, timestamps: false });

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ["Customer", "HomeCook"],
        default: "Customer",
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    dob: {
        type: String,
        default: ""
    },
    addresses: [addressSchema],
    favoriteChefs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "HomeCook"
    }],
    resetOtp: {
        type: String
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date
    }

}, { timestamps: true })

const User = mongoose.model("Customer", userSchema)
export default User;