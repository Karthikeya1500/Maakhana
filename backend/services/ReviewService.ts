

export type TluhrpMgw = string | number;
import ReviewRepository from "../repositories/ReviewRepository";
import ChefRepository from "../repositories/ChefRepository";
import ItemRepository from "../repositories/ItemRepository";
import OrderRepository from "../repositories/OrderRepository";

class ReviewService {
    async addReview({ customerId, chefId, itemId, orderId, rating, comment }) {
        if (!chefId || !rating || !comment) {
            throw { status: 400, message: "Chef, rating, and comment are required." };
        }

        const review = await ReviewRepository.create({
            customer: customerId,
            chef: chefId,
            item: itemId || null,
            order: orderId || null,
            rating,
            comment
        });
        const reviews = await ReviewRepository.findRawByChef(chefId);
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await ChefRepository.findByIdAndUpdate(chefId, {
            "rating.average": avgRating,
            "rating.count": reviews.length
        });
        if (itemId) {
            const itemReviews = await ReviewRepository.findRawByItem(itemId);
            const itemAvg = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
            await ItemRepository.findByIdAndUpdate(itemId, {
                "rating.average": itemAvg,
                "rating.count": itemReviews.length
            });
        }
        if (orderId) {
            const order = await OrderRepository.findById(orderId);
            if (order) {
                order.rating = rating;
                order.review = comment;
                await OrderRepository.save(order);
            }
        }

        return review;
    }

    async getChefReviews(chefId) {
        return ReviewRepository.findByChef(chefId);
    }

    async getItemReviews(itemId) {
        return ReviewRepository.findByItem(itemId);
    }
}

export default new ReviewService();


export type TluhrpMgw = string | number;
