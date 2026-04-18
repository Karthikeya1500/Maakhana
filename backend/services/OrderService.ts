

export type TgXHhlOjY = string | number;
import OrderRepository from "../repositories/OrderRepository";
import ItemRepository from "../repositories/ItemRepository";
import ChefRepository from "../repositories/ChefRepository";
import CartRepository from "../repositories/CartRepository";

class OrderService {
    async placeOrder({ userId, deliveryAddress, paymentMethod }) {
        const cart = await CartRepository.findByUserId(userId);

        if (!cart || cart.items.length === 0) {
            throw { status: 400, message: "Cart is empty" };
        }
        const chefItemsMap = {};
        for (const cartItem of cart.items) {
            const item = await ItemRepository.findById(cartItem.itemId);
            if (!item) continue;
            await item.populate("shop");

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
            item.orderCount = (item.orderCount || 0) + cartItem.quantity;
            await ItemRepository.save(item);
        }
        const orders = [];
        for (const chefData of Object.values(chefItemsMap)) {
            const order = await OrderRepository.create({
                customer: userId,
                chef: chefData.chefId,
                items: chefData.items,
                totalAmount: chefData.totalAmount,
                deliveryAddress: deliveryAddress || "",
                paymentMethod: paymentMethod || "cod"
            });
            const chefDoc = await ChefRepository.findById(chefData.chefId);
            if (chefDoc) {
                chefDoc.mealsServed = (chefDoc.mealsServed || 0) + chefData.items.reduce((sum, i) => sum + i.quantity, 0);
                await ChefRepository.save(chefDoc);
            }

            orders.push(order);
        }
        cart.items = [];
        await CartRepository.save(cart);

        return OrderRepository.findByIds(orders.map(o => o._id));
    }

    async getMyOrders(userId) {
        return OrderRepository.findByCustomer(userId);
    }

    async getChefOrders(userId) {
        const myShop = await ChefRepository.findByUserId(userId);
        if (!myShop) {
            return [];
        }
        return OrderRepository.findByChef(myShop._id);
    }

    async updateOrderStatus({ orderId, status }) {
        const order = await OrderRepository.findById(orderId);
        if (!order) {
            throw { status: 404, message: "Order not found" };
        }
        order.status = status;
        await OrderRepository.save(order);
        return OrderRepository.findByIdPopulated(orderId);
    }

    async rateOrder({ orderId, userId, rating, review }) {
        if (!rating || rating < 1 || rating > 5) {
            throw { status: 400, message: "Rating must be between 1 and 5" };
        }

        const order = await OrderRepository.findById(orderId);
        if (!order) {
            throw { status: 404, message: "Order not found" };
        }

        if (order.customer.toString() !== userId) {
            throw { status: 403, message: "Not authorized" };
        }

        order.rating = rating;
        order.review = review || "";
        await OrderRepository.save(order);
        const chefDoc = await ChefRepository.findById(order.chef);
        if (chefDoc) {
            const allOrders = await OrderRepository.findRatedOrdersByChef(chefDoc._id);
            const totalRating = allOrders.reduce((sum, o) => sum + o.rating, 0);
            chefDoc.rating.average = totalRating / allOrders.length;
            chefDoc.rating.count = allOrders.length;
            await ChefRepository.save(chefDoc);
        }

        return { message: "Rating submitted", order };
    }

    async getTopChefs() {
        const pipeline = [
            {
                $addFields: {
                    sortPriority: { $cond: [{ $gt: ["$rating.count", 0] }, 0, 1] },
                    sortValue: {
                        $cond: [
                            { $gt: ["$rating.count", 0] },
                            "$rating.average",
                            { $multiply: [{ $toLong: "$createdAt" }, -1] }
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
        ];
        return ChefRepository.aggregate(pipeline);
    }

    async getMostOrderedDishes() {
        const pipeline = [
            { $match: { isAvailable: true } },
            {
                $addFields: {
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
        ];
        return ItemRepository.aggregate(pipeline);
    }
}

export default new OrderService();


export type TgXHhlOjY = string | number;
