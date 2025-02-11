import { Router } from "express";
import { createUser, getUser, getUsers } from "../controllers/user.controller";
import upload from "../middlewares/multer";

const userRoute = Router();
userRoute.post("/create", upload.single("profilePhoto"), createUser);
userRoute.get("", getUsers);
userRoute.get("/:userid", getUser);
export default userRoute;
