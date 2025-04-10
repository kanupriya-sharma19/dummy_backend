import { Router } from "express";
import { uploadFields } from "../middlewares/multer.js";
import { authenticateTurfOwner } from "../middlewares/jwt.js";
import {
  signupTurfOwner,
  updateDetails,
  loginTurfOwner,
  logoutTurfOwner,
  getAvailableSlots,getTurfProfile,
  getBookings,getTurfReviews,resetPassword,generateResetLink,changePassword,getAllTurfOwners
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
turfOwnerRoute.get("/all_turfs", getAllTurfOwners);
turfOwnerRoute.get(
  "/getAvailableSlots",
  authenticateTurfOwner,
  getAvailableSlots,
);

turfOwnerRoute.get("/truf-profile", authenticateTurfOwner, getTurfProfile);
turfOwnerRoute.get("/bookings", authenticateTurfOwner, getBookings);
turfOwnerRoute.get("/reviews", authenticateTurfOwner, getTurfReviews);
turfOwnerRoute.post("/reset-password", resetPassword);
turfOwnerRoute.post("/resetLink", generateResetLink);
turfOwnerRoute.post("/change-password", authenticateTurfOwner, changePassword);
export default turfOwnerRoute;
