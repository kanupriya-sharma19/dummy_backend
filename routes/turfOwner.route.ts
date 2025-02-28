import { Router } from "express";
import uploadFields from "../middlewares/multer";
import { authenticateTurfOwner } from "../middlewares/jwt";
import {
  signupTurfOwner,
  updateDetails,
  loginTurfOwner,
  logoutTurfOwner,
} from "../controllers/turfOwner.controller";

const turfOwnerRoute = Router();

turfOwnerRoute.post("/signup", signupTurfOwner);
turfOwnerRoute.put(
  "/updateDetails",
  authenticateTurfOwner,
  uploadFields,
  updateDetails
);
turfOwnerRoute.post("/login", loginTurfOwner);
turfOwnerRoute.post("/logout", logoutTurfOwner);

export default turfOwnerRoute;
