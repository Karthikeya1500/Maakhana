import User from "../models/user.model.js";

class UserRepository {
    async findByEmail(email) {
        return User.findOne({ email });
    }

    async findById(userId) {
        return User.findById(userId);
    }

    async findByIdWithFavorites(userId) {
        return User.findById(userId).populate({
            path: "favoriteChefs",
            select: "name specialty image city state rating"
        });
    }

    async findByIdLean(userId) {
        return User.findById(userId)
            .populate({
                path: "favoriteChefs",
                select: "name specialty image city state rating"
            })
            .lean();
    }

    async create(data) {
        return User.create(data);
    }

    async findByIdAndUpdate(userId, updateData) {
        return User.findByIdAndUpdate(userId, updateData, { new: true });
    }

    async save(user) {
        return user.save();
    }
}

export default new UserRepository();
