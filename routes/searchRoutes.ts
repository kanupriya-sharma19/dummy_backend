
import express from "express";
import { combinedTurfFilter,combinedRentalsFilter} from "../controllers/search.controller.js"; // Correct import

const searchRouter = express.Router();

searchRouter.get("/search", combinedTurfFilter);
searchRouter.get("/searchrental", combinedRentalsFilter);

// searchRouter.get("/Turffilter-by-price", filterTurfsByPrice);
// searchRouter.get("/searchRentals", searchRentals);
// searchRouter.get("/Rentalfilter-by-price", filterRentalsByPrice);
// searchRouter.get("/turf-slots", filterTurfSlots);
export default searchRouter;
