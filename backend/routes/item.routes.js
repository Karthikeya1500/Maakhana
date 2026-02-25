import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import {
    addItem,
    editItem,
    getItemById,
    deleteItem,
    getItemByCity,
    getItemsByShop,
    getItemsByState,
    searchItems,
    rating
} from "../controllers/item.controllers.js"

const itemRouter = express.Router()

// Chef (protected) routes
itemRouter.post("/add", isAuth, upload.single("image"), addItem)
itemRouter.put("/edit/:itemId", isAuth, upload.single("image"), editItem)
itemRouter.delete("/delete/:itemId", isAuth, deleteItem)

// Public routes
itemRouter.get("/search-items", searchItems)
itemRouter.get("/by-city/:city", getItemByCity)
itemRouter.get("/by-state/:state", getItemsByState)
itemRouter.get("/by-shop/:shopId", getItemsByShop)
itemRouter.get("/:itemId", getItemById)

// Rating
itemRouter.post("/rate", isAuth, rating)

export default itemRouter
