import { Router } from "express";
import { authenticateUser, authenticateTurfOwner } from "../middlewares/jwt.js";
import { uploadFields } from "../middlewares/multer.js";

import {
  createRental,
  getAllRentals,
  getRentalById,
  updateRental,
  deleteRental,
} from "../controllers/rental.controllers.js";

const rentalRoute = Router();
rentalRoute.post(
  "/",
  [authenticateUser, authenticateTurfOwner],
  uploadFields,
  createRental,
);

rentalRoute.get("/", getAllRentals);

rentalRoute.get("/:id", getRentalById);

rentalRoute.put(
  "/:id",
  [authenticateUser, authenticateTurfOwner],
  updateRental,
);

rentalRoute.delete(
  "/:id",
  [authenticateUser, authenticateTurfOwner],
  deleteRental,
);

export default rentalRoute;
