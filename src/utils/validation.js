const { ApiError } = require("./api-error");

const buildFieldError = (property, message) => ({
  property,
  message,
});

const isBlank = (value) =>
  value === undefined
  || value === null
  || (typeof value === "string" && value.trim() === "");

const throwValidationError = (message, errors) => {
  throw new ApiError(400, message, errors);
};

const nextValidationError = (next, message, errors) =>
  next(new ApiError(400, message, errors));

const buildRequiredError = (property, label) =>
  buildFieldError(property, `${label} is required`);

const isValidEmailAddress = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));

const isValidUsername = (value) =>
  /^[a-zA-Z0-9_]{3,50}$/.test(String(value || ""));

module.exports = {
  buildFieldError,
  buildRequiredError,
  isBlank,
  throwValidationError,
  nextValidationError,
  isValidEmailAddress,
  isValidUsername,
};
