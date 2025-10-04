class ApiError extends Error {
  status;
  data;

  constructor(statusCode, message, data) {
    super(message);
    this.status = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
