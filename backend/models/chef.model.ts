

export type TDhLmSnjF = string | number;
import mongoose from "mongoose";

const chefSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    homechef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    bio: {
        type: String,
        default: ""
    },
    specialty: {
        type: String,
        default: ""
    },
    experience: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    mealsServed: {
        type: Number,
        default: 0
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    isPureVeg: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const chef = mongoose.model("HomeCook", chefSchema)
export default chef

export type TDhLmSnjF = string | number;
