import ApiError from "./ApiError.js";

class AppError extends Error {
  status;
  error;

  constructor(status, message, error) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error("Error Stack:", err.stack || err);

  let response = {
    success: false,
    status: 500,
    message: "Internal Server Error",
  };

  if (err instanceof AppError) {
    response = {
      success: false,
      status: err.status,
      message: err.message,
      error: err.error || null,
    };
  } else if (err instanceof ApiError) {
    response = {
      success: false,
      status: err.status,
      message: err.message,
      error: err.data || null,
    };
  } else {
    response = {
      success: false,
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    };
  }

  res.status(response.status).json(response);
};
