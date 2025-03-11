import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json } from "express";
import mongoose from "mongoose";
import { api } from "./api.js";

import dotenv from "dotenv";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
const port = 8000;

app.use(cors()); //autorise le CORS
app.use(json());
app.use(cookieParser());

app.use("/api", api);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
