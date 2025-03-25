import express from "express";
import { searchTurfs } from "../controllers/search.js";

const router = express.Router();

router.get("/search", searchTurfs);

export default router;
