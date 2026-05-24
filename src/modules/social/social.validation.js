const { ApiError } = require("../../utils/api-error");
const {
  buildFieldError,
  buildRequiredError,
  isBlank,
  isValidEmailAddress,
} = require("../../utils/validation");

const validateEmailAddressBody = (req, _res, next) => {
  const { emailAddress } = req.body;
  const errors = [];

  if (isBlank(emailAddress)) {
    errors.push(buildRequiredError("emailAddress", "Email address"));
  } else if (!isValidEmailAddress(emailAddress)) {
    errors.push(buildFieldError("emailAddress", "Email address must be valid"));
  }

  if (errors.length) {
    return next(new ApiError(400, "Validation failed", errors));
  }

  return next();
};

const validateFriendAveragesQuery = (req, _res, next) => {
  const { groupId } = req.query;

  if (isBlank(groupId)) {
    return next(new ApiError(400, "Validation failed", [
      buildRequiredError("groupId", "Group ID"),
    ]));
  }

  return next();
};

module.exports = {
  validateEmailAddressBody,
  validateFriendAveragesQuery,
};
