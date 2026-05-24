const { ApiError } = require("../../utils/api-error");
const { buildFieldError, buildRequiredError, isBlank } = require("../../utils/validation");

const validateActivityPayload = (req, _res, next) => {
  const { date } = req.body;
  const errors = [];

  if (req.method === "POST" && isBlank(date)) {
    errors.push(buildRequiredError("date", "Date"));
  }

  if (!isBlank(date) && !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    errors.push(buildFieldError("date", "Date must use YYYY-MM-DD format"));
  }

  if (errors.length) {
    return next(new ApiError(400, "Validation failed", errors));
  }

  return next();
};

module.exports = { validateActivityPayload };
