import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import chef from "../models/chef.model.js";
import Item from "../models/item.model.js";

// POST /api/review/add
export const addReview = async (req, res) => {
    try {
        const { chefId, itemId, orderId, rating, comment } = req.body;
        const customerId = req.userId;

        if (!chefId || !rating || !comment) {
            return res.status(400).json({ message: "Chef, rating, and comment are required." });
        }

        const review = await Review.create({
            customer: customerId,
            chef: chefId,
            item: itemId || null,
            order: orderId || null,
            rating,
            comment
        });

        // Update Chef rating
        const reviews = await Review.find({ chef: chefId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await chef.findByIdAndUpdate(chefId, {
            "rating.average": avgRating,
            "rating.count": reviews.length
        });

        // Update Item rating if applicable
        if (itemId) {
            const itemReviews = await Review.find({ item: itemId });
            const itemAvg = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
            await Item.findByIdAndUpdate(itemId, {
                "rating.average": itemAvg,
                "rating.count": itemReviews.length
            });
        }

        // If orderId is provided, mark order as reviewed (optional, based on existing Order schema)
        if (orderId) {
            await Order.findByIdAndUpdate(orderId, { rating, review: comment });
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: `Add review error: ${error.message}` });
    }
};

// GET /api/review/chef/:chefId
export const getChefReviews = async (req, res) => {
    try {
        const { chefId } = req.params;
        const reviews = await Review.find({ chef: chefId })
            .populate("customer", "fullName")
            .sort({ isTopComment: -1, createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: `Get chef reviews error: ${error.message}` });
    }
};

// GET /api/review/item/:itemId
export const getItemReviews = async (req, res) => {
    try {
        const { itemId } = req.params;
        const reviews = await Review.find({ item: itemId })
            .populate("customer", "fullName")
            .sort({ isTopComment: -1, createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: `Get item reviews error: ${error.message}` });
    }
};
