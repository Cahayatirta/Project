const { ApiError } = require("../utils/api-error");

const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found", [
    { property: "route", message: "Requested route was not found" },
  ]));
};

const errorHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Invalid JSON payload",
      errors: [
        { property: "body", message: "Request body must be valid JSON" },
      ],
    });
  }

  const statusCode = error.statusCode || 500;
  const derivedErrors = Array.isArray(error.errors) && error.errors.length
    ? error.errors
    : [
        {
          property: statusCode >= 500 ? "server" : "general",
          message: error.message || "Internal server error",
        },
      ];

  res.status(statusCode).json({
    message: error.message || "Internal server error",
    errors: derivedErrors,
  });
};

module.exports = { notFoundHandler, errorHandler };
