import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import cors from "cors";
import  userRoute from "./routes/user.route";
const app = express();
app.use(express.json());
dotenv.config();
const port = process.env.PORT;
app.use("/user", userRoute);
app.use(cors());
// app.get('*', (req: Request, res: Response) => {
//   res.send('Hello World!');
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
