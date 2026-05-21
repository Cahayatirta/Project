const { ApiError } = require("../../utils/api-error");

const validateRegister = (req, _res, next) => {
  const { name, emailAddress, password, gender, workLocation } = req.body;

  if (!name || !emailAddress || !password) {
    return next(new ApiError(400, "name, emailAddress, and password are required"));
  }

  if (String(password).length < 8) {
    return next(new ApiError(400, "Password must be at least 8 characters"));
  }

  if (gender && !["male", "female"].includes(gender)) {
    return next(new ApiError(400, "gender must be male or female"));
  }

  if (workLocation && !["on_site", "hybrid", "anywhere"].includes(workLocation)) {
    return next(new ApiError(400, "workLocation must be on_site, hybrid, or anywhere"));
  }

  return next();
};

const validateLogin = (req, _res, next) => {
  const { emailAddress, password } = req.body;

  if (!emailAddress || !password) {
    return next(new ApiError(400, "emailAddress and password are required"));
  }

  return next();
};

module.exports = { validateRegister, validateLogin };
