import Item from "../models/item.model.js";
import chef from "../models/chef.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// POST /api/item/add — Add a new item to the chef's menu
export const addItem = async (req, res) => {
    try {
        console.log("addItem called with body:", req.body);
        console.log("addItem received file:", req.file);

        const { name, description, category, foodType, price, spiceLevel } = req.body

        let image = "";
        if (req.file) {
            try {
                image = await uploadOnCloudinary(req.file.path)
            } catch (uploadErr) {
                console.error("Cloudinary upload failed (continuing without image):", uploadErr.message);
            }
        }

        const shop = await chef.findOne({ homechef: req.userId })
        if (!shop) {
            console.log("Shop not found for user:", req.userId);
            return res.status(400).json({ message: "Shop not found. Please create your shop first." })
        }

        const item = await Item.create({
            name, description, category, foodType, price, spiceLevel,
            ...(image ? { image } : {}),
            shop: shop._id
        })
        console.log("Item created:", item._id);

        shop.items.push(item._id)
        await shop.save()
        await shop.populate("homechef")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(201).json(shop)

    } catch (error) {
        console.error("addItem error catch block:", error);
        return res.status(500).json({ message: `add item error ${error}` })
    }
}

// PUT /api/item/edit/:itemId — Edit an existing item
export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const { name, description, category, foodType, price, spiceLevel, isAvailable } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        const updateData = { name, description, category, foodType, price, spiceLevel }
        if (image) updateData.image = image
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable

        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true })
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await chef.findOne({ homechef: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `edit item error ${error}` })
    }
}

// GET /api/item/:itemId — Get a single item
export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId).populate("shop", "name image city state")
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({ message: `get item error ${error}` })
    }
}

// DELETE /api/item/delete/:itemId — Delete an item
export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await chef.findOne({ homechef: req.userId })
        if (shop) {
            shop.items = shop.items.filter(i => i.toString() !== itemId)
            await shop.save()
            await shop.populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            })
        }
        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `delete item error ${error}` })
    }
}

// GET /api/item/by-city/:city — Get all items in a city
export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(400).json({ message: "city is required" })
        }
        const shops = await chef.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        })
        if (!shops || shops.length === 0) {
            return res.status(200).json([])
        }
        const shopIds = shops.map((shop) => shop._id)
        const items = await Item.find({ shop: { $in: shopIds }, isAvailable: true })
            .populate("shop", "name image city state")
        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `get item by city error ${error}` })
    }
}

// GET /api/item/by-shop/:shopId — Get all items for a specific shop
export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await chef.findById(shopId).populate({
            path: "items",
            options: { sort: { category: 1, updatedAt: -1 } }
        })
        if (!shop) {
            return res.status(400).json({ message: "shop not found" })
        }
        return res.status(200).json({
            shop, items: shop.items
        })
    } catch (error) {
        return res.status(500).json({ message: `get item by shop error ${error}` })
    }
}

// GET /api/item/by-state/:state — Get all items from chefs in a state
export const getItemsByState = async (req, res) => {
    try {
        const { state } = req.params
        const shops = await chef.find({
            state: { $regex: new RegExp(`^${state}$`, "i") }
        })
        if (!shops || shops.length === 0) {
            return res.status(200).json([])
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({ shop: { $in: shopIds }, isAvailable: true })
            .populate("shop", "name image city state")
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).json({ message: `get items by state error ${error}` })
    }
}

// GET /api/item/search-items — Search items by query and city
export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query
        if (!query || !city) {
            return res.status(200).json([])
        }
        const shops = await chef.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        })
        if (!shops || shops.length === 0) {
            return res.status(200).json([])
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        }).populate("shop", "name image")

        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `search item error ${error}` })
    }
}

// POST /api/item/rate — Rate an item
export const rating = async (req, res) => {
    try {
        const { itemId, rating } = req.body

        if (!itemId || !rating) {
            return res.status(400).json({ message: "itemId and rating is required" })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "rating must be between 1 to 5" })
        }

        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }

        const newCount = item.rating.count + 1
        const newAverage = (item.rating.average * item.rating.count + rating) / newCount

        item.rating.count = newCount
        item.rating.average = newAverage
        await item.save()
        return res.status(200).json({ rating: item.rating })

    } catch (error) {
        return res.status(500).json({ message: `rating error ${error}` })
    }
}