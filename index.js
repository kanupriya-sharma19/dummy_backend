import express from "express";
import { router } from "./routes/user.js";
import morgan from 'morgan';
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(morgan("tiny"));
app.use(express.json());
app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
app.use("/user", router);
app.listen(port, () => {
    console.log(`APP IS RUNNING AT PORT ${port}`);
  });

  app.get("/", (req, res) => {
    res.redirect("/user/view");
  });  
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  export { app };