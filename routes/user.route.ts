import { Router } from "express";
import {
  signupUser,
  getUser,
  getUsers,
  updateProfile,
  loginUser,
  logoutUser,
  changePassword,
  resetPassword,
  generateResetLink,
  bookTurf,
} from "../controllers/user.controller.js";
import { uploadSingle } from "../middlewares/multer.js";
import { authenticateUser } from "../middlewares/jwt.js";

const userRoute = Router();
userRoute.post("/signup", uploadSingle, signupUser);
userRoute.get("", getUsers);
userRoute.get("/:userid", getUser);
userRoute.post("/login", loginUser);
userRoute.put("/update", authenticateUser, uploadSingle, updateProfile);
userRoute.post("/reset-password", resetPassword);
userRoute.post("/resetLink", generateResetLink);
userRoute.post("/change-password", authenticateUser, changePassword);
userRoute.post("/logout", logoutUser);

userRoute.post("/bookTurf", authenticateUser, bookTurf);

export default userRoute;
