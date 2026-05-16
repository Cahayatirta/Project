const { ApiError } = require("../../utils/api-error");
const { findUserById } = require("./user.repository");

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

module.exports = { getCurrentUser };
