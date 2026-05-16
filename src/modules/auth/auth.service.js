const bcrypt = require("bcryptjs");

const { USER_ROLES } = require("../../constants/roles");
const { ApiError } = require("../../utils/api-error");
const { signAccessToken } = require("../../utils/jwt");
const { createUser, findUserByEmail } = require("./auth.repository");

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const register = async ({ fullName, email, password, role }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({
    fullName,
    email,
    password: hashedPassword,
    role: role || USER_ROLES.USER,
  });

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, "Email or password is incorrect");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Email or password is incorrect");
  }

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

module.exports = { register, login, sanitizeUser };
