import Cart from "../models/cart.model.js";

/**
 * CartRepository
 * Encapsulates all raw database operations for the Cart collection.
 */
class CartRepository {
    async findByUserId(userId) {
        return Cart.findOne({ userId });
    }

    async create(data) {
        return new Cart(data);
    }

    async save(cart) {
        return cart.save();
    }
}

export default new CartRepository();
