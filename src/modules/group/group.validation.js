const { ApiError } = require("../../utils/api-error");
const {
  buildFieldError,
  buildRequiredError,
  isBlank,
  isValidEmailAddress,
} = require("../../utils/validation");

const validateCreateGroup = (req, _res, next) => {
  const { groupName, description } = req.body;

  if (isBlank(groupName)) {
    return next(new ApiError(400, "Validation failed", [
      buildRequiredError("groupName", "Group name"),
    ]));
  }

  if (!isBlank(description) && typeof description !== "string") {
    return next(new ApiError(400, "Validation failed", [
      buildFieldError("description", "Group description must be a string"),
    ]));
  }

  return next();
};

const validateAddFriendToGroup = (req, _res, next) => {
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

module.exports = {
  validateCreateGroup,
  validateAddFriendToGroup,
};
