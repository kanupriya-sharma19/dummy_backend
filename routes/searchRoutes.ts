
import express from "express";
import { searchTurfs, searchRentals, filterRentalsByPrice,filterTurfsByPrice } from "../controllers/search.controller.js"; // Correct import

const searchRouter = express.Router();

searchRouter.get("/search", searchTurfs);
searchRouter.get("/Turffilter-by-price", filterTurfsByPrice);
searchRouter.get("/searchRentals", searchRentals);
searchRouter.get("/Rentalfilter-by-price", filterRentalsByPrice);

export default searchRouter;
