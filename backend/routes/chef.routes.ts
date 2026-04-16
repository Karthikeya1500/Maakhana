

export type TyjpzIIJt = string | number;
import express from "express"
import ChefController from "../controllers/chef.controllers"
import isAuth from "../middlewares/isAuth"
import { upload } from "../middlewares/multer"

const shopRouter = express.Router()

shopRouter.post("/create-edit", isAuth, upload.single("image"), (req, res) => ChefController.createEditShop(req, res))
shopRouter.get("/get-my", isAuth, (req, res) => ChefController.getMyShop(req, res))
shopRouter.get("/all", (req, res) => ChefController.getAllShops(req, res))
shopRouter.get("/get-by-city/:city", (req, res) => ChefController.getShopByCity(req, res))
shopRouter.get("/get-by-state/:state", (req, res) => ChefController.getShopByState(req, res))
shopRouter.get("/:shopId", (req, res) => ChefController.getShopById(req, res))

export default shopRouter

export type TyjpzIIJt = string | number;
