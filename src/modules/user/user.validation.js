const { ApiError } = require("../../utils/api-error");
const { buildFieldError, isBlank, isValidUsername } = require("../../utils/validation");

const validateUpdateProfile = (req, _res, next) => {
  const { username } = req.body;
  const errors = [];

  if (!isBlank(username) && !isValidUsername(username)) {
    errors.push(buildFieldError("username", "Username must be 3-50 characters and only contain letters, numbers, or underscore"));
  }

  if (errors.length) {
    return next(new ApiError(400, "Validation failed", errors));
  }

  return next();
};

module.exports = { validateUpdateProfile };
