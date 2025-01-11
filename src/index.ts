import express from "express";
import * as dotenv from "dotenv";
import userRouter from "./routes/userRouter";
import authenticationRouter from "./routes/authenticationRouter";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authenticationRouter);

app.get("/", (req, res) => {
  res.send("Welcome to transit planner api");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
