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

  // **Handle Prisma Errors**
  if (err) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        response = {
          success: false,
          status: 400,
          message: `Duplicate field value: ${err.meta?.target}`,
        };
        break;
      case "P2025": // Record not found
        response = {
          success: false,
          status: 404,
          message: `Record not found: ${err.meta?.cause || "Unknown"}`,
        };
        break;
      default:
        response = {
          success: false,
          status: 500,
          message: `Database error: ${err.message}`,
        };
        break;
    }
  }

  // **Handle Custom App Errors**
  else if (err instanceof AppError) {
    response = {
      success: false,
      status: err.status,
      message: err.message,
      error: err.error || null,
    };
  }

  // **Handle Other Errors**
  else {
    response = {
      success: false,
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    };
  }

  res.status(response.status).json(response);
};
