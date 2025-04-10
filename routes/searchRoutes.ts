import express from "express";
import { filterTurfsByPrice,filterRentalsByPrice,searchRentals,searchTurfs } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", searchTurfs);
router.get("/searchRentals", searchRentals);
router.get("/filter-by-price", filterTurfsByPrice);
router.get("/Rentalfilter-by-price", filterRentalsByPrice);
export default router;
