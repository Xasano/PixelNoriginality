import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";
import { User } from "../models/User.js";
import express from "express";

const userRouter = express.Router();

userRouter.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

userRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user === null) {
      throw new ApiErrorException(ApiError.NOT_FOUND, 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

userRouter.put("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (user === null) {
      throw new ApiErrorException(ApiError.NOT_FOUND, 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

userRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user === null) {
      throw new ApiErrorException(ApiError.NOT_FOUND, 404);
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export { userRouter };
