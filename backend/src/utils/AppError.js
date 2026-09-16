class AppError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isAppError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
