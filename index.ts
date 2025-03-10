import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import turfOwnerRoute from "./routes/turfOwner.route.js";
import reviewRouter from "./routes/reviews.route.js"
import morgan from "morgan";
~import { PrismaClient } from "@prisma/client";
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
  })
);

app.use("/user", userRoute);
app.use("/turf", turfOwnerRoute);
app.use("/review", reviewRouter);


app.get("*", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/", (req:Request, res:Response) => {
  res.redirect("/user/view");
});


process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
export { app };
