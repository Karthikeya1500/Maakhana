

export type TyRtgILjf = string | number;
import ReviewService from "../services/ReviewService";

class ReviewController {
    async addReview(req, res) {
        try {
            const review = await ReviewService.addReview({ customerId: req.userId, ...req.body });
            return res.status(201).json(review);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `Add review error: ${error.message}` });
        }
    }

    async getChefReviews(req, res) {
        try {
            const reviews = await ReviewService.getChefReviews(req.params.chefId);
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ message: `Get chef reviews error: ${error.message}` });
        }
    }

    async getItemReviews(req, res) {
        try {
            const reviews = await ReviewService.getItemReviews(req.params.itemId);
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ message: `Get item reviews error: ${error.message}` });
        }
    }
}

export default new ReviewController();


export type TyRtgILjf = string | number;
