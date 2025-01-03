import express from "express";
import * as dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.get("/", (req, res) => {
  res.send("Welcome to transit planner api");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
