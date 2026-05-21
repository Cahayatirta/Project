const bcrypt = require("bcryptjs");

const { ApiError } = require("../../utils/api-error");
const { signAccessToken } = require("../../utils/jwt");
const { createUser, findUserByEmail } = require("./auth.repository");

const sanitizeUser = (user) => ({
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

const register = async ({
  name,
  emailAddress,
  password,
  birthDate,
  gender,
  job,
  workLocation,
  hobby,
}) => {
  const existingUser = await findUserByEmail(emailAddress);

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    emailAddress,
    password: hashedPassword,
    birthDate,
    gender,
    job,
    workLocation,
    hobby,
  });

  const token = signAccessToken({
    sub: user.id,
    emailAddress: user.email_address,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

const login = async ({ emailAddress, password }) => {
  const user = await findUserByEmail(emailAddress);

  if (!user) {
    throw new ApiError(401, "Email or password is incorrect");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Email or password is incorrect");
  }

  const token = signAccessToken({
    sub: user.id,
    emailAddress: user.email_address,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

const logout = async () => ({
  message: "Logout successful. Remove the bearer token on the client side.",
});

module.exports = { register, login, logout, sanitizeUser };
