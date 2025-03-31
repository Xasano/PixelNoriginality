import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json } from "express";
import mongoose from "mongoose";
import { api } from "./api.js";
import { authenticateVisitor } from "./middleware/visitorAuth.js";

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

// Configuration CORS plus détaillée pour accepter les credentials
app.use(
  cors({
    origin: [
      "http://localhost:81",
      "http://localhost",
      "http://localhost:80",
      "http://localhost:3000",
      "https://pixelnoriginality.fun",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(json());
app.use(cookieParser());
app.use(authenticateVisitor);

app.use("/api", api);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
