const { ApiError } = require("../utils/api-error");

const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found"));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error",
  });
};

module.exports = { notFoundHandler, errorHandler };
