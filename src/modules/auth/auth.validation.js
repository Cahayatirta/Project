const { ApiError } = require("../../utils/api-error");

const validateRegister = (req, _res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new ApiError(400, "fullName, email, and password are required"));
  }

  if (String(password).length < 8) {
    return next(new ApiError(400, "Password must be at least 8 characters"));
  }

  return next();
};

const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "email and password are required"));
  }

  return next();
};

module.exports = { validateRegister, validateLogin };
