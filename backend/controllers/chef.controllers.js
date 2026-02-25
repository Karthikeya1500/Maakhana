import chef from "../models/chef.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// POST /api/shop/create-edit — Create or update a chef's shop
export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address, bio, specialty, experience } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        let shop = await chef.findOne({ homechef: req.userId })

        if (!shop) {
            shop = await chef.create({
                name, city, state, address, bio, specialty, experience,
                image: image || "",
                homechef: req.userId
            })
        } else {
            const updateData = { name, city, state, address, bio, specialty, experience }
            if (image) updateData.image = image
            shop = await chef.findByIdAndUpdate(shop._id, updateData, { new: true })
        }

        await shop.populate("homechef")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `create shop error ${error}` })
    }
}

// GET /api/shop/get-my — Get the logged-in chef's shop with items
export const getMyShop = async (req, res) => {
    try {
        const shop = await chef.findOne({ homechef: req.userId })
            .populate("homechef")
            .populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            })

        if (!shop) {
            return res.status(200).json(null)
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get my shop error ${error}` })
    }
}

// GET /api/shop/get-by-city/:city — Get all chefs in a city
export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params

        const shops = await chef.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')

        if (!shops) {
            return res.status(400).json({ message: "shops not found" })
        }
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({ message: `get shop by city error ${error}` })
    }
}

// GET /api/shop/get-by-state/:state — Get all chefs in a state
export const getShopByState = async (req, res) => {
    try {
        const { state } = req.params

        const shops = await chef.find({
            state: { $regex: new RegExp(`^${state}$`, "i") }
        }).populate("homechef", "fullName email").populate("items")

        return res.status(200).json(shops || [])
    } catch (error) {
        return res.status(500).json({ message: `get shop by state error ${error}` })
    }
}

// GET /api/shop/:shopId — Get a specific chef's public profile with full menu
export const getShopById = async (req, res) => {
    try {
        const { shopId } = req.params

        const shop = await chef.findById(shopId)
            .populate("homechef", "fullName email")
            .populate({
                path: "items",
                options: { sort: { category: 1, updatedAt: -1 } }
            })

        if (!shop) {
            return res.status(404).json({ message: "Chef not found" })
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get shop by id error ${error}` })
    }
}

// GET /api/shop/all — Get all chefs (with optional state filter)
export const getAllShops = async (req, res) => {
    try {
        const { state } = req.query
        const filter = {}
        if (state) {
            filter.state = { $regex: new RegExp(`^${state}$`, "i") }
        }

        const shops = await chef.find(filter)
            .populate("homechef", "fullName email")
            .populate("items")
            .sort({ "rating.average": -1 })

        return res.status(200).json(shops || [])
    } catch (error) {
        return res.status(500).json({ message: `get all shops error ${error}` })
    }
}