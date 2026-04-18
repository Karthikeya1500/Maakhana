import CartRepository from "../repositories/CartRepository.js";

class CartService {
    async getCart(userId) {
        const cart = await CartRepository.findByUserId(userId);
        if (!cart) {
            return { items: [], totalAmount: 0 };
        }
        return { items: cart.items, totalAmount: cart.totalAmount };
    }

    async addToCart({ userId, itemId, name, image, price, quantity = 1, chef = "" }) {
        if (!itemId || !name || price === undefined) {
            throw { status: 400, message: "itemId, name, and price are required" };
        }

        let cart = await CartRepository.findByUserId(userId);

        if (!cart) {
            cart = CartRepository.create({
                userId,
                items: [{ itemId, name, image, price, quantity, chef }]
            });
        } else {
            const existingItem = cart.items.find(i => i.itemId === itemId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ itemId, name, image, price, quantity, chef });
            }
        }

        await CartRepository.save(cart);
        return { message: "Item added to cart", items: cart.items, totalAmount: cart.totalAmount };
    }

    async updateCartItem({ userId, itemId, quantity }) {
        if (!itemId || quantity === undefined) {
            throw { status: 400, message: "itemId and quantity are required" };
        }

        const cart = await CartRepository.findByUserId(userId);
        if (!cart) {
            throw { status: 404, message: "Cart not found" };
        }

        const item = cart.items.find(i => i.itemId === itemId);
        if (!item) {
            throw { status: 404, message: "Item not found in cart" };
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.itemId !== itemId);
        } else {
            item.quantity = quantity;
        }

        await CartRepository.save(cart);
        return { message: "Cart updated", items: cart.items, totalAmount: cart.totalAmount };
    }

    async removeFromCart({ userId, itemId }) {
        const cart = await CartRepository.findByUserId(userId);
        if (!cart) {
            throw { status: 404, message: "Cart not found" };
        }

        cart.items = cart.items.filter(i => i.itemId !== itemId);
        await CartRepository.save(cart);
        return { message: "Item removed from cart", items: cart.items, totalAmount: cart.totalAmount };
    }

    async clearCart(userId) {
        const cart = await CartRepository.findByUserId(userId);
        if (cart) {
            cart.items = [];
            await CartRepository.save(cart);
        }
        return { message: "Cart cleared", items: [], totalAmount: 0 };
    }
}

export default new CartService();
