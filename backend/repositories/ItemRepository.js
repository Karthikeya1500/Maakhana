import Item from "../models/item.model.js";

/**
 * ItemRepository
 * Encapsulates all raw database operations for the Item collection.
 */
class ItemRepository {
    async create(data) {
        return Item.create(data);
    }

    async findById(itemId) {
        return Item.findById(itemId);
    }

    async findByIdWithShop(itemId) {
        return Item.findById(itemId).populate("shop", "name image city state");
    }

    async findByIdAndUpdate(itemId, updateData) {
        return Item.findByIdAndUpdate(itemId, updateData, { new: true });
    }

    async findByIdAndDelete(itemId) {
        return Item.findByIdAndDelete(itemId);
    }

    async findByShopIds(shopIds) {
        return Item.find({ shop: { $in: shopIds }, isAvailable: true })
            .populate("shop", "name image city state");
    }

    async searchByShopIds(shopIds, query) {
        return Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        }).populate("shop", "name image");
    }

    async save(item) {
        return item.save();
    }

    async aggregate(pipeline) {
        return Item.aggregate(pipeline);
    }
}

export default new ItemRepository();
