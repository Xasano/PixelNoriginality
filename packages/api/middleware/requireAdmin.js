import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";

// Middleware pour vérifier si l'utilisateur est administrateur
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiErrorException(
      ApiError.FORBIDDEN,
      403,
      "Accès réservé aux administrateurs",
    );
  }
  next();
};
