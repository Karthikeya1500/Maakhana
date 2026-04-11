import express from "express";
import isAuth from "../middlewares/isAuth.js";
import OrderController from "../controllers/order.controllers.js";

const orderRouter = express.Router();

// Public
orderRouter.get("/top-chefs", (req, res) => OrderController.getTopChefs(req, res));
orderRouter.get("/most-ordered", (req, res) => OrderController.getMostOrderedDishes(req, res));

// Protected — customer
orderRouter.post("/place", isAuth, (req, res) => OrderController.placeOrder(req, res));
orderRouter.get("/my-orders", isAuth, (req, res) => OrderController.getMyOrders(req, res));
orderRouter.post("/rate/:orderId", isAuth, (req, res) => OrderController.rateOrder(req, res));

// Protected — chef
orderRouter.get("/chef-orders", isAuth, (req, res) => OrderController.getChefOrders(req, res));
orderRouter.put("/update-status/:orderId", isAuth, (req, res) => OrderController.updateOrderStatus(req, res));

export default orderRouter;
