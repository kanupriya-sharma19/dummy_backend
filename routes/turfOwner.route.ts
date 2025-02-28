import { Router } from "express";
import { uploadFields } from "../middlewares/multer.js";
import { authenticateTurfOwner } from "../middlewares/jwt.js";
import {
  signupTurfOwner,
  updateDetails,
  loginTurfOwner,
  logoutTurfOwner,
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

export default turfOwnerRoute;
