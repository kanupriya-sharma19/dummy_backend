import { Router } from "express";
import { createReview, getTurfReviews, getUserReviews, updateReview, deleteReview } from "../controllers/reviews.controller";
import { authenticateUser } from "../middlewares/jwt";
const reviewRouter = Router();

reviewRouter.post("/", authenticateUser, createReview);
reviewRouter.get("/turf/:turfId", getTurfReviews);
reviewRouter.get("/user", authenticateUser, getUserReviews);
reviewRouter.put("/:id", authenticateUser, updateReview);
reviewRouter.delete("/:id", authenticateUser, deleteReview);

export default reviewRouter;
