import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import turfOwnerRoute from "./routes/turfOwner.route.js";
import reviewRouter from "./routes/reviews.route.js";
import searchRouter from "./routes/searchRoutes.js";
import paymentRoutes from "./routes/payment.route.js";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import rentalRoute from "./routes/rental.route.js";
import listEndpoints from "express-list-endpoints";

const prisma = new PrismaClient();

dotenv.config();
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use("/user", userRoute);
app.use("/turf", turfOwnerRoute);
app.use("/review", reviewRouter);
app.use("/rentals", rentalRoute);
app.use("/api", searchRouter);
app.use("/payment", paymentRoutes);

// app.get("*", (req: Request, res: Response) => {
//   res.send("Hello World!");
// });

app.get("/", (req: Request, res: Response) => {
  res.redirect("/user/view");
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
=====
// app.get('*', (req: Request, res: Response) => {
//   res.send('Hello World!');
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// List all endpoints
console.log(listEndpoints(app));
export { app };
