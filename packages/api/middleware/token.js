import jwt from "jsonwebtoken";
import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";

// TODO: store blacklisted tokens in a database or cache
const blacklistedTokens = [];

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (token == null || blacklistedTokens.includes(token)) {
    throw new ApiErrorException(ApiError.UNAUTHORIZED, 401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      throw new ApiErrorException(ApiError.UNAUTHORIZED, 401);
    }

    req.user = user;
    next();
  });
};

export const authenticateRefreshToken = (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (token == null || blacklistedTokens.includes(token)) {
    throw new ApiErrorException(ApiError.UNAUTHORIZED, 401);
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      throw new ApiErrorException(ApiError.UNAUTHORIZED, 401);
    }

    req.user = user;
    next();
  });
};

export const addBlacklistedToken = (token) => {
  if (token && !blacklistedTokens.includes(token)) {
    blacklistedTokens.push(token);

    // Optional: add logic to clean up the blacklist periodically
    // This is important in production to prevent memory leaks
    if (blacklistedTokens.length > 1000) {
      // Remove the oldest tokens when the list gets too large
      blacklistedTokens.splice(0, 100);
    }
  }
};
