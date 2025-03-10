import { Router } from "express";
import { uploadFields } from "../middlewares/multer.js";
import { authenticateTurfOwner } from "../middlewares/jwt.js";
import {
  signupTurfOwner,
  updateDetails,
  loginTurfOwner,
  logoutTurfOwner,
  getAvailableSlots,
  getBookings,
} from "../controllers/turfOwner.controller.js";

const turfOwnerRoute = Router();

turfOwnerRoute.post("/signup", signupTurfOwner);
turfOwnerRoute.put(
  "/updateDetails",
  authenticateTurfOwner,
  uploadFields,
  updateDetails,
);
turfOwnerRoute.post("/login", loginTurfOwner);
turfOwnerRoute.post("/logout", logoutTurfOwner);
turfOwnerRoute.get(
  "/getAvailableSlots",
  authenticateTurfOwner,
  getAvailableSlots,
);

turfOwnerRoute.get("/bookings", authenticateTurfOwner, getBookings);

export default turfOwnerRoute;
