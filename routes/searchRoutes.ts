
import express from "express";
import { searchTurfs, searchRentals, filterRentalsByPrice,filterTurfsByPrice ,filterTurfSlots} from "../controllers/search.controller.js"; // Correct import

const searchRouter = express.Router();

searchRouter.get("/search", searchTurfs);
searchRouter.get("/Turffilter-by-price", filterTurfsByPrice);
searchRouter.get("/searchRentals", searchRentals);
searchRouter.get("/Rentalfilter-by-price", filterRentalsByPrice);
searchRouter.get("/turf-slots", filterTurfSlots);
export default searchRouter;
