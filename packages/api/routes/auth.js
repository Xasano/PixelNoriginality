import bcrypt from "bcrypt";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";
import {
  addBlacklistedToken,
  authenticateRefreshToken,
  authenticateToken,
} from "../middleware/token.js";
import { User } from "../models/User.js";

const authRouter = express.Router();

authRouter.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const decoded = req.user;
    const user = await User.findById(decoded.id);
    if (user === null) {
      throw new ApiErrorException(ApiError.UNAUTHORIZED, 401);
    }

    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (name === undefined || email === undefined || password === undefined) {
      throw new ApiErrorException(ApiError.BAD_REQUEST, 400);
    }

    // check email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new ApiErrorException(ApiError.INVALID_EMAIL_FORMAT, 400);
    }

    // check email is already registered
    var user = await User.findOne({ email: email });
    if (user !== null) {
      throw new ApiErrorException(ApiError.EMAIL_ALREADY_REGISTERED, 400);
    }

    // check if username is already taken
    user = await User.findOne({ name: name });
    if (user !== null) {
      throw new ApiErrorException(ApiError.USERNAME_ALREADY_TAKEN, 400);
    }

    // check if password is strong enough
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new ApiErrorException(ApiError.WEAK_PASSWORD, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken, {
      path: "/api/auth/refresh",
    });
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email === undefined || password === undefined) {
      throw new ApiErrorException(ApiError.BAD_REQUEST, 400);
    }

    const user = await User.findOne({ email: email });
    if (user === null) {
      throw new ApiErrorException(ApiError.WRONG_EMAIL_OR_PASSWORD, 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ApiErrorException(ApiError.WRONG_EMAIL_OR_PASSWORD, 401);
    }

    user.lastConnection = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken, {
      path: "/api/auth/refresh",
    });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", authenticateToken, async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
      addBlacklistedToken(accessToken);
    }

    if (refreshToken) {
      addBlacklistedToken(refreshToken);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

authRouter.post(
  "/refresh",
  authenticateRefreshToken,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (user === null) {
        throw new ApiErrorException(ApiError.UNAUTHORIZED, 401);
      }

      // Blacklist the old refresh token
      const oldRefreshToken = req.cookies.refreshToken;
      if (oldRefreshToken) {
        addBlacklistedToken(oldRefreshToken);
      }

      user.lastConnection = new Date();
      await user.save();

      // Generate new tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Set new cookies
      res.cookie("accessToken", accessToken);
      res.cookie("refreshToken", refreshToken, {
        path: "/api/auth/refresh",
      });
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

// Helper functions for token generation
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      timestamp: new Date().getTime(),
      uuid: crypto.randomUUID(),
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      timestamp: new Date().getTime(),
      uuid: crypto.randomUUID(),
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export { authRouter };
