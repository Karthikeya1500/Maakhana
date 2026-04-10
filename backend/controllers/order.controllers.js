import OrderService from "../services/OrderService.js";

/**
 * OrderController
 * Handles HTTP request/response for all order routes.
 * Delegates all business logic to OrderService.
 */
class OrderController {
    async placeOrder(req, res) {
        try {
            const orders = await OrderService.placeOrder({
                userId: req.userId,
                deliveryAddress: req.body.deliveryAddress,
                paymentMethod: req.body.paymentMethod
            });
            return res.status(201).json(orders);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `place order error: ${error}` });
        }
    }

    async getMyOrders(req, res) {
        try {
            const orders = await OrderService.getMyOrders(req.userId);
            return res.status(200).json(orders);
        } catch (error) {
            return res.status(500).json({ message: `get my orders error: ${error}` });
        }
    }

    async getChefOrders(req, res) {
        try {
            const orders = await OrderService.getChefOrders(req.userId);
            return res.status(200).json(orders);
        } catch (error) {
            return res.status(500).json({ message: `get chef orders error: ${error}` });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const order = await OrderService.updateOrderStatus({ orderId: req.params.orderId, status: req.body.status });
            return res.status(200).json(order);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `update order status error: ${error}` });
        }
    }

    async rateOrder(req, res) {
        try {
            const result = await OrderService.rateOrder({
                orderId: req.params.orderId,
                userId: req.userId,
                rating: req.body.rating,
                review: req.body.review
            });
            return res.status(200).json(result);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `rate order error: ${error}` });
        }
    }

    async getTopChefs(req, res) {
        try {
            const chefs = await OrderService.getTopChefs();
            return res.status(200).json(chefs);
        } catch (error) {
            return res.status(500).json({ message: `get top chefs error: ${error}` });
        }
    }

    async getMostOrderedDishes(req, res) {
        try {
            const dishes = await OrderService.getMostOrderedDishes();
            return res.status(200).json(dishes);
        } catch (error) {
            return res.status(500).json({ message: `get most ordered dishes error: ${error}` });
        }
    }
}

export default new OrderController();
