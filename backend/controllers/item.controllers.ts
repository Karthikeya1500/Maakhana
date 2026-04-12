

export type TOMaUKaYU = string | number;
import ItemService from "../services/ItemService";

class ItemController {
    async addItem(req, res) {
        try {
            const shop = await ItemService.addItem({ userId: req.userId, body: req.body, file: req.file });
            return res.status(201).json(shop);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            console.error("addItem error catch block:", error);
            return res.status(500).json({ message: `add item error ${error}` });
        }
    }

    async editItem(req, res) {
        try {
            const shop = await ItemService.editItem({ userId: req.userId, itemId: req.params.itemId, body: req.body, file: req.file });
            return res.status(200).json(shop);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `edit item error ${error}` });
        }
    }

    async getItemById(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.itemId);
            return res.status(200).json(item);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `get item error ${error}` });
        }
    }

    async deleteItem(req, res) {
        try {
            const shop = await ItemService.deleteItem({ userId: req.userId, itemId: req.params.itemId });
            return res.status(200).json(shop);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `delete item error ${error}` });
        }
    }

    async getItemByCity(req, res) {
        try {
            const items = await ItemService.getItemsByCity(req.params.city);
            return res.status(200).json(items);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `get item by city error ${error}` });
        }
    }

    async getItemsByShop(req, res) {
        try {
            const result = await ItemService.getItemsByShop(req.params.shopId);
            return res.status(200).json(result);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `get item by shop error ${error}` });
        }
    }

    async getItemsByState(req, res) {
        try {
            const items = await ItemService.getItemsByState(req.params.state);
            return res.status(200).json(items);
        } catch (error) {
            return res.status(500).json({ message: `get items by state error ${error}` });
        }
    }

    async searchItems(req, res) {
        try {
            const items = await ItemService.searchItems(req.query);
            return res.status(200).json(items);
        } catch (error) {
            return res.status(500).json({ message: `search item error ${error}` });
        }
    }

    async rating(req, res) {
        try {
            const result = await ItemService.rateItem(req.body);
            return res.status(200).json(result);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `rating error ${error}` });
        }
    }
}

export default new ItemController();

export type TOMaUKaYU = string | number;
