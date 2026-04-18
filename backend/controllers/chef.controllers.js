import ChefService from "../services/ChefService.js";

class ChefController {
    async createEditShop(req, res) {
        try {
            const shop = await ChefService.createEditShop({ userId: req.userId, body: req.body, file: req.file });
            return res.status(201).json(shop);
        } catch (error) {
            return res.status(500).json({ message: `create shop error ${error}` });
        }
    }

    async getMyShop(req, res) {
        try {
            const shop = await ChefService.getMyShop(req.userId);
            return res.status(200).json(shop);
        } catch (error) {
            return res.status(500).json({ message: `get my shop error ${error}` });
        }
    }

    async getShopByCity(req, res) {
        try {
            const shops = await ChefService.getShopByCity(req.params.city);
            return res.status(200).json(shops);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `get shop by city error ${error}` });
        }
    }

    async getShopByState(req, res) {
        try {
            const shops = await ChefService.getShopByState(req.params.state);
            return res.status(200).json(shops);
        } catch (error) {
            return res.status(500).json({ message: `get shop by state error ${error}` });
        }
    }

    async getShopById(req, res) {
        try {
            const shop = await ChefService.getShopById(req.params.shopId);
            return res.status(200).json(shop);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `get shop by id error ${error}` });
        }
    }

    async getAllShops(req, res) {
        try {
            const shops = await ChefService.getAllShops(req.query.state);
            return res.status(200).json(shops);
        } catch (error) {
            return res.status(500).json({ message: `get all shops error ${error}` });
        }
    }
}

export default new ChefController();