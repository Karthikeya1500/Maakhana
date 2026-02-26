import express from "express";
import { addReview, getChefReviews, getItemReviews } from "../controllers/review.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/add", isAuth, addReview);
router.get("/chef/:chefId", getChefReviews);
router.get("/item/:itemId", getItemReviews);

export default router;
