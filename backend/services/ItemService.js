import ItemRepository from "../repositories/ItemRepository.js";
import ChefRepository from "../repositories/ChefRepository.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import Chef from "../models/chef.model.js";

/**
 * ItemService
 * Contains all business logic for menu item operations.
 * Does NOT import or use Express — fully framework-agnostic.
 */
class ItemService {
    async addItem({ userId, body, file }) {
        console.log("addItem called with body:", body);
        console.log("addItem received file:", file);

        const { name, description, category, foodType, price, spiceLevel } = body;

        let image = "";
        if (file) {
            try {
                image = await uploadOnCloudinary(file.path);
            } catch (uploadErr) {
                console.error("Cloudinary upload failed (continuing without image):", uploadErr.message);
            }
        }

        const shop = await ChefRepository.findByUserId(userId);
        if (!shop) {
            console.log("Shop not found for user:", userId);
            throw { status: 400, message: "Shop not found. Please create your shop first." };
        }

        const item = await ItemRepository.create({
            name, description, category, foodType, price, spiceLevel,
            ...(image ? { image } : {}),
            shop: shop._id
        });
        console.log("Item created:", item._id);

        shop.items.push(item._id);
        await ChefRepository.save(shop);
        await shop.populate("homechef");
        await shop.populate({ path: "items", options: { sort: { updatedAt: -1 } } });
        return shop;
    }

    async editItem({ userId, itemId, body, file }) {
        const { name, description, category, foodType, price, spiceLevel, isAvailable } = body;
        let image;
        if (file) {
            image = await uploadOnCloudinary(file.path);
        }

        const updateData = { name, description, category, foodType, price, spiceLevel };
        if (image) updateData.image = image;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

        const item = await ItemRepository.findByIdAndUpdate(itemId, updateData);
        if (!item) {
            throw { status: 400, message: "item not found" };
        }

        // Fetch the shop with populated items sorted by updatedAt desc (matches original)
        const shop = await Chef.findOne({ homechef: userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });
        return shop;
    }

    async getItemById(itemId) {
        const item = await ItemRepository.findByIdWithShop(itemId);
        if (!item) {
            throw { status: 400, message: "item not found" };
        }
        return item;
    }

    async deleteItem({ userId, itemId }) {
        const item = await ItemRepository.findByIdAndDelete(itemId);
        if (!item) {
            throw { status: 400, message: "item not found" };
        }
        const shop = await ChefRepository.findByUserId(userId);
        if (shop) {
            shop.items = shop.items.filter(i => i.toString() !== itemId);
            await ChefRepository.save(shop);
            await shop.populate({ path: "items", options: { sort: { updatedAt: -1 } } });
        }
        return shop;
    }

    async getItemsByCity(city) {
        if (!city) {
            throw { status: 400, message: "city is required" };
        }
        const shops = await Chef.find({ city: { $regex: new RegExp(`^${city}$`, "i") } });
        if (!shops || shops.length === 0) {
            return [];
        }
        const shopIds = shops.map(s => s._id);
        return ItemRepository.findByShopIds(shopIds);
    }

    async getItemsByShop(shopId) {
        const shop = await ChefRepository.findById(shopId);
        if (!shop) {
            throw { status: 400, message: "shop not found" };
        }
        await shop.populate({ path: "items", options: { sort: { category: 1, updatedAt: -1 } } });
        return { shop, items: shop.items };
    }

    async getItemsByState(state) {
        const shops = await Chef.find({ state: { $regex: new RegExp(`^${state}$`, "i") } });
        if (!shops || shops.length === 0) {
            return [];
        }
        const shopIds = shops.map(s => s._id);
        return ItemRepository.findByShopIds(shopIds);
    }

    async searchItems({ query, city }) {
        if (!query || !city) {
            return [];
        }
        const shops = await Chef.find({ city: { $regex: new RegExp(`^${city}$`, "i") } });
        if (!shops || shops.length === 0) {
            return [];
        }
        const shopIds = shops.map(s => s._id);
        return ItemRepository.searchByShopIds(shopIds, query);
    }

    async rateItem({ itemId, rating }) {
        if (!itemId || !rating) {
            throw { status: 400, message: "itemId and rating is required" };
        }
        if (rating < 1 || rating > 5) {
            throw { status: 400, message: "rating must be between 1 to 5" };
        }

        const item = await ItemRepository.findById(itemId);
        if (!item) {
            throw { status: 400, message: "item not found" };
        }

        const newCount = item.rating.count + 1;
        const newAverage = (item.rating.average * item.rating.count + rating) / newCount;
        item.rating.count = newCount;
        item.rating.average = newAverage;
        await ItemRepository.save(item);
        return { rating: item.rating };
    }
}

export default new ItemService();
