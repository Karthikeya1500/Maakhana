import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cart.controllers.js";

const cartRouter = express.Router();

// All cart routes require authentication
cartRouter.get("/", isAuth, getCart);
cartRouter.post("/add", isAuth, addToCart);
cartRouter.put("/update", isAuth, updateCartItem);
cartRouter.delete("/remove/:itemId", isAuth, removeFromCart);
cartRouter.delete("/clear", isAuth, clearCart);

export default cartRouter;
