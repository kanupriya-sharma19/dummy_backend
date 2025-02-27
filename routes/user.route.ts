import { Router } from "express";
import {
  signupUser,
  getUser,
  getUsers,
  updateProfile,
  loginUser,
  logoutUser,changePassword,
  resetPassword,
  generateResetLink,
} from "../controllers/user.controller";
import uploadFields from "../middlewares/multer";
import { authenticateUser } from "../middlewares/jwt";

const userRoute = Router();
userRoute.post("/signup", uploadFields, signupUser);
userRoute.get("", getUsers);
userRoute.get("/:userid", getUser);
userRoute.post("/login", loginUser);
userRoute.put(
  "/update",
  authenticateUser,
  uploadFields,
  updateProfile,
);
userRoute.post("/reset-password",  resetPassword);
userRoute.post("/resetLink", generateResetLink);
userRoute.post("/change-password", authenticateUser,changePassword);
userRoute.post("/logout", logoutUser);

export default userRoute;
