import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    placeOrder,
    getMyOrders,
    getChefOrders,
    updateOrderStatus,
    rateOrder,
    getTopChefs,
    getMostOrderedDishes
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

// Public
orderRouter.get("/top-chefs", getTopChefs);
orderRouter.get("/most-ordered", getMostOrderedDishes);

// Protected — customer
orderRouter.post("/place", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.post("/rate/:orderId", isAuth, rateOrder);

// Protected — chef
orderRouter.get("/chef-orders", isAuth, getChefOrders);
orderRouter.put("/update-status/:orderId", isAuth, updateOrderStatus);

export default orderRouter;
