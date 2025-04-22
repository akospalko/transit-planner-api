import "module-alias/register";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import userRouter from "@src/routes/userRouter";
import authenticationRouter from "@src/routes/authenticationRouter";
import assetLinkRouter from "./routes/assetLinkRouter";
import allowedOrigins from "@src/config/allowedOrigins";
import "@src/cron/blacklistedTokenCleanupCron";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: allowedOrigins }));
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1/assetlinks", assetLinkRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authenticationRouter);

app.get("/", (req, res) => {
  res.send("Welcome to transit planner api");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
