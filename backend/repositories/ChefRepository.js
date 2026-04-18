import Chef from "../models/chef.model.js";

class ChefRepository {
    async findByUserId(userId) {
        return Chef.findOne({ homechef: userId });
    }

    async findByUserIdPopulated(userId) {
        return Chef.findOne({ homechef: userId })
            .populate("homechef")
            .populate({ path: "items", options: { sort: { updatedAt: -1 } } });
    }

    async findById(shopId) {
        return Chef.findById(shopId);
    }

    async findByIdWithDetails(shopId) {
        return Chef.findById(shopId)
            .populate("homechef", "fullName email")
            .populate({ path: "items", options: { sort: { category: 1, updatedAt: -1 } } });
    }

    async findByCity(city) {
        return Chef.find({ city: { $regex: new RegExp(`^${city}$`, "i") } }).populate("items");
    }

    async findByState(state) {
        return Chef.find({ state: { $regex: new RegExp(`^${state}$`, "i") } })
            .populate("homechef", "fullName email")
            .populate("items");
    }

    async findAll(filter = {}) {
        return Chef.find(filter)
            .populate("homechef", "fullName email")
            .populate("items")
            .sort({ "rating.average": -1 });
    }

    async create(data) {
        return Chef.create(data);
    }

    async findByIdAndUpdate(shopId, updateData) {
        return Chef.findByIdAndUpdate(shopId, updateData, { new: true });
    }

    async save(chef) {
        return chef.save();
    }

    async aggregate(pipeline) {
        return Chef.aggregate(pipeline);
    }
}

export default new ChefRepository();
