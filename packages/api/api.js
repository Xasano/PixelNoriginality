import { Router } from "express";
import { apiErrorHandler } from "./middleware/ApiErrorHandler.js";
import { authRouter } from "./routes/auth.js";

const api = Router();

api.get("/", (req, res) => {
  // GET SUR localhost:8000/
  res.json("Hello World!");
});

api.use("/auth", authRouter);
api.use(apiErrorHandler);

export { api };
