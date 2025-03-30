import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";

// Middleware qui limite le nombre de requêtes par minute pour les visiteurs
export const limitVisitorRequests = (maxRequestsPerMinute = 30) => {
  return async (req, res, next) => {
    try {
      // Si ce n'est pas un visiteur, pas de limitation
      if (!req.visitor) {
        return next();
      }
      // Vérifier le rate limiting
      const checkResult =
        await req.visitor.checkRateLimit(maxRequestsPerMinute);

      if (!checkResult.allowed) {
        throw new ApiErrorException(
          ApiError.TOO_MANY_REQUESTS,
          429,
          checkResult.reason,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
