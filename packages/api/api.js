import { Router } from "express";
import { apiErrorHandler } from "./middleware/ApiErrorHandler.js";
import { authRouter } from "./routes/auth.js";
import { pixelBoardRouter } from "./routes/pixelBoards.js";

const api = Router();

api.get("/", (req, res) => {
  res.json("Hello World!");
});

api.use("/auth", authRouter);
api.use("/pixel-boards", pixelBoardRouter);

api.use(apiErrorHandler);

export { api };
