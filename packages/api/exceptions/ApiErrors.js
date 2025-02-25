export const ApiError = {
  BAD_REQUEST: "BAD_REQUEST",
  WRONG_EMAIL_OR_PASSWORD: "WRONG_EMAIL_OR_PASSWORD",
};

export const ApiErrorDescription = {
  [ApiError.BAD_REQUEST]: "Request is invalid or malformed",
  [ApiError.WRONG_EMAIL_OR_PASSWORD]: "Email or password is incorrect",
};

export class ApiErrorException extends Error {
  constructor(error, status, description = ApiErrorDescription[error]) {
    super(description);
    this.error = error;
    this.status = status;
    this.description = description;
    this.name = this.error;
    // Nécessaire pour que instanceof fonctionne correctement avec les classes qui étendent Error
    Object.setPrototypeOf(this, ApiErrorException.prototype);
  }
}
