import Order from "../models/order.model.js";
import Item from "../models/item.model.js";
import chef from "../models/chef.model.js";
import Cart from "../models/cart.model.js";

// POST /api/order/place — Place an order from the cart
export const placeOrder = async (req, res) => {
    try {
        const { deliveryAddress, paymentMethod } = req.body;
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Group items by chef
        const chefItemsMap = {};
        for (const cartItem of cart.items) {
            const item = await Item.findById(cartItem.itemId).populate("shop");
            if (!item) continue;

            const chefId = item.shop._id.toString();
            if (!chefItemsMap[chefId]) {
                chefItemsMap[chefId] = { chefId, items: [], totalAmount: 0 };
            }
            chefItemsMap[chefId].items.push({
                item: item._id,
                name: item.name,
                image: item.image,
                price: cartItem.price,
                quantity: cartItem.quantity
            });
            chefItemsMap[chefId].totalAmount += cartItem.price * cartItem.quantity;

            // Increment order count for the item
            item.orderCount = (item.orderCount || 0) + cartItem.quantity;
            await item.save();
        }

        // Create one order per chef
        const orders = [];
        for (const chefData of Object.values(chefItemsMap)) {
            const order = await Order.create({
                customer: req.userId,
                chef: chefData.chefId,
                items: chefData.items,
                totalAmount: chefData.totalAmount,
                deliveryAddress: deliveryAddress || "",
                paymentMethod: paymentMethod || "cod"
            });

            // Increment meals served for the chef
            const chefDoc = await chef.findById(chefData.chefId);
            if (chefDoc) {
                chefDoc.mealsServed = (chefDoc.mealsServed || 0) + chefData.items.reduce((sum, i) => sum + i.quantity, 0);
                await chefDoc.save();
            }

            orders.push(order);
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

        const populatedOrders = await Order.find({ _id: { $in: orders.map(o => o._id) } })
            .populate("chef", "name image city state")
            .populate("items.item", "name image price")
            .sort({ createdAt: -1 });

        return res.status(201).json(populatedOrders);
    } catch (error) {
        return res.status(500).json({ message: `place order error: ${error}` });
    }
};

// GET /api/order/my-orders — Get all orders for the logged-in customer
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.userId })
            .populate("chef", "name image city state")
            .populate("items.item", "name image price")
            .sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: `get my orders error: ${error}` });
    }
};

// GET /api/order/chef-orders — Get all orders for the logged-in chef
export const getChefOrders = async (req, res) => {
    try {
        const myShop = await chef.findOne({ homechef: req.userId });
        if (!myShop) {
            return res.status(200).json([]);
        }
        const orders = await Order.find({ chef: myShop._id })
            .populate("customer", "fullName email")
            .populate("items.item", "name image price")
            .sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: `get chef orders error: ${error}` });
    }
};

// PUT /api/order/update-status/:orderId — Update order status (chef only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        const populated = await Order.findById(orderId)
            .populate("customer", "fullName email")
            .populate("chef", "name image city state")
            .populate("items.item", "name image price");

        return res.status(200).json(populated);
    } catch (error) {
        return res.status(500).json({ message: `update order status error: ${error}` });
    }
};

// POST /api/order/rate/:orderId — Rate a chef via order
export const rateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.customer.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        order.rating = rating;
        order.review = review || "";
        await order.save();

        // Update chef's average rating
        const chefDoc = await chef.findById(order.chef);
        if (chefDoc) {
            const allOrders = await Order.find({ chef: chefDoc._id, rating: { $ne: null } });
            const totalRating = allOrders.reduce((sum, o) => sum + o.rating, 0);
            chefDoc.rating.average = totalRating / allOrders.length;
            chefDoc.rating.count = allOrders.length;
            await chefDoc.save();
        }

        return res.status(200).json({ message: "Rating submitted", order });
    } catch (error) {
        return res.status(500).json({ message: `rate order error: ${error}` });
    }
};

// GET /api/order/top-chefs — Get top chefs by rating
export const getTopChefs = async (req, res) => {
    try {
        // Use aggregation for single efficient query instead of two sequential queries
        const chefs = await chef.aggregate([
            {
                $addFields: {
                    // Sort priority: rated chefs first (by rating), then newest
                    sortPriority: { $cond: [{ $gt: ["$rating.count", 0] }, 0, 1] },
                    sortValue: {
                        $cond: [
                            { $gt: ["$rating.count", 0] },
                            "$rating.average",
                            { $multiply: [{ $toLong: "$createdAt" }, -1] } // Negative for desc order
                        ]
                    }
                }
            },
            { $sort: { sortPriority: 1, sortValue: -1 } },
            { $limit: 4 },
            {
                $lookup: {
                    from: "users",
                    localField: "homechef",
                    foreignField: "_id",
                    as: "homechef",
                    pipeline: [{ $project: { fullName: 1, email: 1 } }]
                }
            },
            { $unwind: { path: "$homechef", preserveNullAndEmptyArrays: true } },
            { $project: { sortPriority: 0, sortValue: 0 } }
        ]);

        return res.status(200).json(chefs);
    } catch (error) {
        return res.status(500).json({ message: `get top chefs error: ${error}` });
    }
};

// GET /api/order/most-ordered — Get most ordered dishes
export const getMostOrderedDishes = async (req, res) => {
    try {
        // Use aggregation for single efficient query instead of two sequential queries
        const dishes = await Item.aggregate([
            { $match: { isAvailable: true } },
            {
                $addFields: {
                    // Sort priority: ordered dishes first, then newest
                    sortPriority: { $cond: [{ $gt: [{ $ifNull: ["$orderCount", 0] }, 0] }, 0, 1] },
                    sortValue: {
                        $cond: [
                            { $gt: [{ $ifNull: ["$orderCount", 0] }, 0] },
                            "$orderCount",
                            { $multiply: [{ $toLong: "$createdAt" }, -1] }
                        ]
                    }
                }
            },
            { $sort: { sortPriority: 1, sortValue: -1 } },
            { $limit: 6 },
            {
                $lookup: {
                    from: "chefs",
                    localField: "shop",
                    foreignField: "_id",
                    as: "shop",
                    pipeline: [{ $project: { name: 1, image: 1, city: 1, state: 1 } }]
                }
            },
            { $unwind: { path: "$shop", preserveNullAndEmptyArrays: true } },
            { $project: { sortPriority: 0, sortValue: 0 } }
        ]);

        return res.status(200).json(dishes);
    } catch (error) {
        return res.status(500).json({ message: `get most ordered dishes error: ${error}` });
    }
};

