

export type TpTHRsMHf = string | number;
import UserService from "../services/UserService";

class UserController {
    async getCurrentUser(req, res) {
        try {
            const user = await UserService.getCurrentUser(req.userId);
            return res.status(200).json(user);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `get current user error ${error}` });
        }
    }

    async updateUserLocation(req, res) {
        try {
            const result = await UserService.updateUserLocation({ userId: req.userId, ...req.body });
            return res.status(200).json(result);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `update location user error ${error}` });
        }
    }

    async updateProfile(req, res) {
        try {
            const user = await UserService.updateProfile({ userId: req.userId, ...req.body });
            return res.status(200).json(user);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Update profile error: ${error}` });
        }
    }

    async addAddress(req, res) {
        try {
            const addresses = await UserService.addAddress({ userId: req.userId, ...req.body });
            return res.status(201).json(addresses);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Add address error: ${error}` });
        }
    }

    async updateAddress(req, res) {
        try {
            const addresses = await UserService.updateAddress({ userId: req.userId, addressId: req.params.addressId, updates: req.body });
            return res.status(200).json(addresses);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Update address error: ${error}` });
        }
    }

    async deleteAddress(req, res) {
        try {
            const addresses = await UserService.deleteAddress({ userId: req.userId, addressId: req.params.addressId });
            return res.status(200).json(addresses);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Delete address error: ${error}` });
        }
    }

    async toggleFavoriteChef(req, res) {
        try {
            const favorites = await UserService.toggleFavoriteChef({ userId: req.userId, chefId: req.params.chefId });
            return res.status(200).json(favorites);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Toggle favorite error: ${error}` });
        }
    }

    async getFavoriteChefs(req, res) {
        try {
            const favorites = await UserService.getFavoriteChefs(req.userId);
            return res.status(200).json(favorites);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Get favorites error: ${error}` });
        }
    }
}

export default new UserController();


export type TpTHRsMHf = string | number;
