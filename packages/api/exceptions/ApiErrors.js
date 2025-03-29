export const ApiError = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_EMAIL_FORMAT: "INVALID_EMAIL_FORMAT",
  USERNAME_ALREADY_TAKEN: "USERNAME_ALREADY_TAKEN",
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  WRONG_EMAIL_OR_PASSWORD: "WRONG_EMAIL_OR_PASSWORD",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  SAME_PASSWORD: "SAME_PASSWORD",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  DAILY_LIMIT_EXCEEDED: "DAILY_LIMIT_EXCEEDED"
};

export const ApiErrorDescription = {
  [ApiError.BAD_REQUEST]: "Request is invalid or malformed",
  [ApiError.UNAUTHORIZED]: "Unauthorized",
  [ApiError.INVALID_EMAIL_FORMAT]: "Email format is invalid",
  [ApiError.USERNAME_ALREADY_TAKEN]: "Username is already taken",
  [ApiError.EMAIL_ALREADY_REGISTERED]: "Email is already registered",
  [ApiError.WEAK_PASSWORD]: "Password is too weak",
  [ApiError.WRONG_EMAIL_OR_PASSWORD]: "Email or password is incorrect",
  [ApiError.FORBIDDEN]: "Accès forbiden",
  [ApiError.NOT_FOUND]: "Resource not found",
  [ApiError.SAME_PASSWORD]: "New password is the same as the old one",
  [ApiError.TOO_MANY_REQUESTS]:
    "Trop de requêtes. Veuillez réessayer plus tard.",
  [ApiError.DAILY_LIMIT_EXCEEDED]:
    "Limite quotidienne atteinte. Veuillez réessayer demain ou créer un compte.",
};

export class ApiErrorException extends Error {
  constructor(error, status, description = ApiErrorDescription[error]) {
    super(description);
    this.error = error;
    this.status = status;
    this.description = description;
    this.name = this.error;
    // Needed for instanceof checks to work correctly
    Object.setPrototypeOf(this, ApiErrorException.prototype);
  }
}
