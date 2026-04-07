

export type TeEjSMrDg = string | number;
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HomeCook"
    },
    category: {
        type: String,
        enum: ["Snacks",
            "Main Course",
            "Desserts",
            "Breakfast",
            "Sides & Pickles",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Beverages",
            "Others"
        ],
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    foodType: {
        type: String,
        enum: ["veg", "non veg"],
        required: true
    },
    spiceLevel: {
        type: Number,
        min: 0,
        max: 3,
        default: 1
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    orderCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const Item = mongoose.model("Item", itemSchema)
export default Item

export type TeEjSMrDg = string | number;
