const bcrypt = require("bcryptjs");

const { ApiError } = require("../../utils/api-error");
const { ensureDefaultFriendGroup } = require("../group/group.service");
const { signAccessToken } = require("../../utils/jwt");
const { createUser, findUserByEmail, findUserByUsername } = require("./auth.repository");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  emailAddress: user.email_address,
  birthDate: user.birth_date,
  gender: user.gender,
  job: user.job,
  workLocation: user.work_location,
  hobby: user.hobby,
  biodata: user.biodata,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const register = async ({
  name,
  username,
  emailAddress,
  password,
  birthDate,
  gender,
  job,
  workLocation,
  hobby,
  biodata,
}) => {
  const normalizedUsername = String(username).toLowerCase();
  const existingUser = await findUserByEmail(emailAddress);

  if (existingUser) {
    throw new ApiError(409, "Email is already registered", [
      { property: "emailAddress", message: "Email address is already registered" },
    ]);
  }

  const existingUsername = await findUserByUsername(normalizedUsername);

  if (existingUsername) {
    throw new ApiError(409, "Username is already registered", [
      { property: "username", message: "Username is already registered" },
    ]);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    username: normalizedUsername,
    emailAddress,
    password: hashedPassword,
    birthDate,
    gender,
    job,
    workLocation,
    hobby,
    biodata,
  });

  await ensureDefaultFriendGroup(user.id);

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
