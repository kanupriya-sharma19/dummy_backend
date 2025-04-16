import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/jwt.js";
const router = express.Router();

router.post("/create-order", authenticateUser,createOrder);
router.post("/verify-payment", authenticateUser,verifyPayment);

export default router;
