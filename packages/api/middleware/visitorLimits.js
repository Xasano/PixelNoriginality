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

// Middleware qui limite l'accès à certaines fonctionnalités pour les visiteurs
export const restrictVisitorAccess = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Si ce n'est pas un visiteur, pas de restriction
      if (!req.visitor) {
        return next();
      }

      // Vérifier si l'action est autorisée pour les visiteurs
      if (
        options.forbiddenActions &&
        options.forbiddenActions.includes(req.method)
      ) {
        throw new ApiErrorException(
          ApiError.FORBIDDEN,
          403,
          "Cette action n'est pas autorisée pour les visiteurs",
        );
      }

      // Vérifier le nombre de requêtes par minute
      if (options.maxRequestsPerMinute) {
        const checkResult = await req.visitor.checkRateLimit(
          options.maxRequestsPerMinute,
        );

        if (!checkResult.allowed) {
          throw new ApiErrorException(
            ApiError.TOO_MANY_REQUESTS,
            429,
            checkResult.reason,
          );
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
