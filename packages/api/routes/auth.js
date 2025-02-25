import express from "express";
import jwt from "jsonwebtoken";
import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";
import { User } from "../models/User.js";

const authRouter = express.Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (username === undefined || password === undefined) {
      throw new ApiErrorException(ApiError.BAD_REQUEST, 400);
    }

    const user = await User.find({ email: username, password: password });
    if (user === null) {
      throw new ApiErrorException(ApiError.WRONG_EMAIL_OR_PASSWORD, 401);
    }

    const accessToken = jwt.sign({}, process.env.TOKEN_SECRET, {
      expiresIn: "1800s",
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

export { authRouter };
