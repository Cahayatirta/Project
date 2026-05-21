const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const { ApiError } = require("../utils/api-error");

const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden"));
  }

  return next();
};

module.exports = { authenticate, authorize };
