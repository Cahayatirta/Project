const { ApiError } = require("../../utils/api-error");
const { findUserById, updateUserById } = require("./user.repository");

const mapUser = (user) => ({
  id: user.id,
  name: user.name,
  emailAddress: user.email_address,
  birthDate: user.birth_date,
  gender: user.gender,
  job: user.job,
  workLocation: user.work_location,
  hobby: user.hobby,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return mapUser(user);
};

const getUserProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return mapUser(user);
};

const updateCurrentUser = async (userId, payload) => {
  const updatedUser = await updateUserById(userId, {
    name: payload.name,
    birth_date: payload.birthDate,
    gender: payload.gender,
    job: payload.job,
    work_location: payload.workLocation,
    hobby: payload.hobby,
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return mapUser(updatedUser);
};

module.exports = { getCurrentUser, getUserProfile, updateCurrentUser };
