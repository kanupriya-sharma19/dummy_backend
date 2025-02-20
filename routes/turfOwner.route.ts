import { Router } from "express";
import upload from "../middlewares/multer";
import { authenticateTurfOwner } from "../middlewares/jwt";
import {
  signupTurfOwner,
  updateDetails,
  loginTurfOwner,
} from "../controllers/turfOwner.controller";

const turfOwnerRoute = Router();

turfOwnerRoute.post("/signup", signupTurfOwner);
turfOwnerRoute.put(
  "/updateDetails",
  authenticateTurfOwner,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "turfPhotos", maxCount: 5 },
  ]),
  updateDetails,
);
turfOwnerRoute.post("/login", loginTurfOwner);

export default turfOwnerRoute;
