const { ApiError } = require("../../utils/api-error");
const {
  buildFieldError,
  buildRequiredError,
  isBlank,
  isValidEmailAddress,
  isValidUsername,
} = require("../../utils/validation");

const validateRegister = (req, _res, next) => {
  const { name, username, emailAddress, password, gender, workLocation } = req.body;
  const errors = [];

  if (isBlank(name)) errors.push(buildRequiredError("name", "Name"));
  if (isBlank(username)) errors.push(buildRequiredError("username", "Username"));
  if (isBlank(emailAddress)) errors.push(buildRequiredError("emailAddress", "Email address"));
  if (isBlank(password)) errors.push(buildRequiredError("password", "Password"));

  if (!isBlank(emailAddress) && !isValidEmailAddress(emailAddress)) {
    errors.push(buildFieldError("emailAddress", "Email address must be valid"));
  }

  if (!isBlank(username) && !isValidUsername(username)) {
    errors.push(buildFieldError("username", "Username must be 3-50 characters and only contain letters, numbers, or underscore"));
  }

  if (!isBlank(password) && String(password).length < 8) {
    errors.push(buildFieldError("password", "Password must be at least 8 characters"));
  }

  if (gender && !["male", "female"].includes(gender)) {
    errors.push(buildFieldError("gender", "Gender must be male or female"));
  }

  if (workLocation && !["on_site", "hybrid", "anywhere"].includes(workLocation)) {
    errors.push(buildFieldError("workLocation", "Work location must be on_site, hybrid, or anywhere"));
  }

  if (errors.length) {
    return next(new ApiError(400, "Validation failed", errors));
  }

  return next();
};

const validateLogin = (req, _res, next) => {
  const { emailAddress, password } = req.body;
  const errors = [];

  if (isBlank(emailAddress)) errors.push(buildRequiredError("emailAddress", "Email address"));
  if (isBlank(password)) errors.push(buildRequiredError("password", "Password"));

  if (!isBlank(emailAddress) && !isValidEmailAddress(emailAddress)) {
    errors.push(buildFieldError("emailAddress", "Email address must be valid"));
  }

  if (errors.length) {
    return next(new ApiError(400, "Validation failed", errors));
  }

  return next();
};

module.exports = { validateRegister, validateLogin };
