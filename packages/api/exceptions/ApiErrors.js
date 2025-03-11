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
