import express from "express"
import {
    getCurrentUser,
    updateUserLocation,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleFavoriteChef,
    getFavoriteChefs
} from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.post('/update-location', isAuth, updateUserLocation)

// Profile
userRouter.put("/profile", isAuth, updateProfile)

// Addresses
userRouter.post("/address", isAuth, addAddress)
userRouter.put("/address/:addressId", isAuth, updateAddress)
userRouter.delete("/address/:addressId", isAuth, deleteAddress)

// Favorite chefs
userRouter.get("/favorites", isAuth, getFavoriteChefs)
userRouter.post("/favorites/:chefId", isAuth, toggleFavoriteChef)

export default userRouter