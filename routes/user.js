import express from "express";
import { display,postUser,updateUser,deleteUser } from "../controllers/user.js";

const router = express.Router();
router.get("/view",display);
router.post("/insert",postUser);
router.delete("/delete/:id", deleteUser);
router.put("/update/:id",updateUser);
export { router };