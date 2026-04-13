

export type ThFbQZjjJ = string | number;
import express from "express";
import isAuth from "../middlewares/isAuth";
import OrderController from "../controllers/order.controllers";

const orderRouter = express.Router();
orderRouter.get("/top-chefs", (req, res) => OrderController.getTopChefs(req, res));
orderRouter.get("/most-ordered", (req, res) => OrderController.getMostOrderedDishes(req, res));
orderRouter.post("/place", isAuth, (req, res) => OrderController.placeOrder(req, res));
orderRouter.get("/my-orders", isAuth, (req, res) => OrderController.getMyOrders(req, res));
orderRouter.post("/rate/:orderId", isAuth, (req, res) => OrderController.rateOrder(req, res));
orderRouter.get("/chef-orders", isAuth, (req, res) => OrderController.getChefOrders(req, res));
orderRouter.put("/update-status/:orderId", isAuth, (req, res) => OrderController.updateOrderStatus(req, res));

export default orderRouter;


export type ThFbQZjjJ = string | number;
