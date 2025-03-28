import { ApiErrorException } from "../exceptions/ApiErrors.js";

export const apiErrorHandler = (err, req, res, next) => {
  // Si c'est une erreur API connue, on la traite spécifiquement
  if (err instanceof ApiErrorException) {
    return res.status(err.status).json({
      error: err.error,
      message: err.description,
      status: err.status,
    });
  }

  // Pour les erreurs non gérées, on renvoie une erreur 500
  console.error("Erreur non gérée:", err);
  return res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Une erreur interne est survenue",
    status: 500,
  });
};
