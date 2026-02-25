import Cart from "../models/cart.model.js";

// GET /api/cart — Fetch the current user's cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(200).json({ items: [], totalAmount: 0 });
        }
        return res.status(200).json({ items: cart.items, totalAmount: cart.totalAmount });
    } catch (error) {
        console.error("getCart error:", error);
        return res.status(500).json({ message: "Failed to fetch cart" });
    }
};

// POST /api/cart/add — Add an item to cart (or increment quantity if it exists)
export const addToCart = async (req, res) => {
    try {
        const { itemId, name, image, price, quantity = 1, chef = "" } = req.body;

        if (!itemId || !name || price === undefined) {
            return res.status(400).json({ message: "itemId, name, and price are required" });
        }

        let cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.userId,
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

        await cart.save();
        return res.status(200).json({ message: "Item added to cart", items: cart.items, totalAmount: cart.totalAmount });
    } catch (error) {
        console.error("addToCart error:", error);
        return res.status(500).json({ message: "Failed to add item to cart" });
    }
};

// PUT /api/cart/update — Update quantity of an item in cart
export const updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        if (!itemId || quantity === undefined) {
            return res.status(400).json({ message: "itemId and quantity are required" });
        }

        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.find(i => i.itemId === itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.itemId !== itemId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        return res.status(200).json({ message: "Cart updated", items: cart.items, totalAmount: cart.totalAmount });
    } catch (error) {
        console.error("updateCartItem error:", error);
        return res.status(500).json({ message: "Failed to update cart item" });
    }
};

// DELETE /api/cart/remove/:itemId — Remove an item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(i => i.itemId !== itemId);
        await cart.save();

        return res.status(200).json({ message: "Item removed from cart", items: cart.items, totalAmount: cart.totalAmount });
    } catch (error) {
        console.error("removeFromCart error:", error);
        return res.status(500).json({ message: "Failed to remove item from cart" });
    }
};

// DELETE /api/cart/clear — Clear the entire cart
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return res.status(200).json({ message: "Cart cleared", items: [], totalAmount: 0 });
    } catch (error) {
        console.error("clearCart error:", error);
        return res.status(500).json({ message: "Failed to clear cart" });
    }
};
