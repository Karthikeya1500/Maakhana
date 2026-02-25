import express from "express"
import { createEditShop, getMyShop, getShopByCity, getShopByState, getShopById, getAllShops } from "../controllers/chef.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

const shopRouter = express.Router()

shopRouter.post("/create-edit", isAuth, upload.single("image"), createEditShop)
shopRouter.get("/get-my", isAuth, getMyShop)
shopRouter.get("/all", getAllShops)
shopRouter.get("/get-by-city/:city", getShopByCity)
shopRouter.get("/get-by-state/:state", getShopByState)
shopRouter.get("/:shopId", getShopById)

export default shopRouter