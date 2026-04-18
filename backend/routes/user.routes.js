import express from "express"
import UserController from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.get("/current", isAuth, (req, res) => UserController.getCurrentUser(req, res))
userRouter.post('/update-location', isAuth, (req, res) => UserController.updateUserLocation(req, res))
userRouter.put("/profile", isAuth, (req, res) => UserController.updateProfile(req, res))
userRouter.post("/address", isAuth, (req, res) => UserController.addAddress(req, res))
userRouter.put("/address/:addressId", isAuth, (req, res) => UserController.updateAddress(req, res))
userRouter.delete("/address/:addressId", isAuth, (req, res) => UserController.deleteAddress(req, res))
userRouter.get("/favorites", isAuth, (req, res) => UserController.getFavoriteChefs(req, res))
userRouter.post("/favorites/:chefId", isAuth, (req, res) => UserController.toggleFavoriteChef(req, res))

export default userRouter