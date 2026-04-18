import UserRepository from "../repositories/UserRepository.js";

class UserService {
    async getCurrentUser(userId) {
        if (!userId) {
            throw { status: 400, message: "userId is not found" };
        }
        const user = await UserRepository.findByIdLean(userId);
        if (!user) {
            throw { status: 400, message: "user is not found" };
        }
        return user;
    }

    async updateUserLocation({ userId, lat, lon }) {
        const user = await UserRepository.findByIdAndUpdate(userId, {
            location: { type: "Point", coordinates: [lon, lat] }
        });
        if (!user) {
            throw { status: 400, message: "user is not found" };
        }
        return { message: "location updated" };
    }

    async updateProfile({ userId, fullName, phone, dob }) {
        const user = await UserRepository.findByIdAndUpdate(userId, { fullName, phone, dob });
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        return user;
    }

    async addAddress({ userId, label, fullAddress, city, state, pincode, phone, isDefault }) {
        if (!fullAddress) {
            throw { status: 400, message: "Full address is required" };
        }
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        if (isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
        }
        const makeDefault = user.addresses.length === 0 ? true : !!isDefault;

        user.addresses.push({ label, fullAddress, city, state, pincode, phone, isDefault: makeDefault });
        await UserRepository.save(user);
        return user.addresses;
    }

    async updateAddress({ userId, addressId, updates }) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        const addr = user.addresses.id(addressId);
        if (!addr) {
            throw { status: 404, message: "Address not found" };
        }
        if (updates.isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
        }
        Object.assign(addr, updates);
        await UserRepository.save(user);
        return user.addresses;
    }

    async deleteAddress({ userId, addressId }) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
        await UserRepository.save(user);
        return user.addresses;
    }

    async toggleFavoriteChef({ userId, chefId }) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        const idx = user.favoriteChefs.findIndex(id => id.toString() === chefId);
        if (idx > -1) {
            user.favoriteChefs.splice(idx, 1);
        } else {
            user.favoriteChefs.push(chefId);
        }
        await UserRepository.save(user);
        const populated = await UserRepository.findByIdWithFavorites(userId);
        return populated.favoriteChefs;
    }

    async getFavoriteChefs(userId) {
        const user = await UserRepository.findByIdWithFavorites(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        return user.favoriteChefs;
    }
}

export default new UserService();
