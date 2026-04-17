

export type TXtZSHJSE = string | number;
import ChefRepository from "../repositories/ChefRepository";
import uploadOnCloudinary from "../utils/cloudinary";

class ChefService {
    async createEditShop({ userId, body, file }) {
        const { name, city, state, address, bio, specialty, experience } = body;
        let image;
        if (file) {
            image = await uploadOnCloudinary(file.path);
        }

        let shop = await ChefRepository.findByUserId(userId);

        if (!shop) {
            shop = await ChefRepository.create({
                name, city, state, address, bio, specialty, experience,
                image: image || "",
                homechef: userId
            });
        } else {
            const updateData = { name, city, state, address, bio, specialty, experience };
            if (image) updateData.image = image;
            shop = await ChefRepository.findByIdAndUpdate(shop._id, updateData);
        }

        await shop.populate("homechef");
        await shop.populate({ path: "items", options: { sort: { updatedAt: -1 } } });
        return shop;
    }

    async getMyShop(userId) {
        const shop = await ChefRepository.findByUserIdPopulated(userId);
        return shop || null;
    }

    async getShopByCity(city) {
        const shops = await ChefRepository.findByCity(city);
        if (!shops) {
            throw { status: 400, message: "shops not found" };
        }
        return shops;
    }

    async getShopByState(state) {
        const shops = await ChefRepository.findByState(state);
        return shops || [];
    }

    async getShopById(shopId) {
        const shop = await ChefRepository.findByIdWithDetails(shopId);
        if (!shop) {
            throw { status: 404, message: "Chef not found" };
        }
        return shop;
    }

    async getAllShops(state) {
        const filter = {};
        if (state) {
            filter.state = { $regex: new RegExp(`^${state}$`, "i") };
        }
        const shops = await ChefRepository.findAll(filter);
        return shops || [];
    }
}

export default new ChefService();


export type TXtZSHJSE = string | number;
