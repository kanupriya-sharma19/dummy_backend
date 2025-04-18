import { Router } from "express";
import {
  createReview,
  getTurfReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";
import { authenticateUser } from "../middlewares/jwt.js";
import { uploadFields } from "../middlewares/multer.js";
const reviewRouter = Router();


reviewRouter.get("/turf/:turfId", getTurfReviews);
reviewRouter.get("/user", authenticateUser, getUserReviews);
reviewRouter.put("/:id", authenticateUser, updateReview);
reviewRouter.delete("/:id", authenticateUser, deleteReview);
reviewRouter.post("/", authenticateUser, uploadFields,createReview);
export default reviewRouter;
