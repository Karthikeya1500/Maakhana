

export type TpelFhMlc = string | number;
import Cart from "../models/cart.model";

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


export type TpelFhMlc = string | number;
