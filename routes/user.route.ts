import { Router } from "express";
import {
  signupUser,
  getUser,
  getUsers,
  updateProfile,
  loginUser,
  logoutUser,
  resetPassword,
  generateResetLink,
} from "../controllers/user.controller";
import upload from "../middlewares/multer";
import { authenticateUser } from "../middlewares/jwt";

const userRoute = Router();
userRoute.post("/signup", upload.single("profilePhoto"), signupUser);
userRoute.get("", getUsers);
userRoute.get("/:userid", getUser);
userRoute.post("/login", loginUser);
userRoute.put(
  "/update",
  authenticateUser,
  upload.single("profilePhoto"),
  updateProfile,
);
userRoute.post("/reset-password", resetPassword);
userRoute.post("/resetLink", generateResetLink);
userRoute.post("/logout", logoutUser);

export default userRoute;
