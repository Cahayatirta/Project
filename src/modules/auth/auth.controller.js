const { asyncHandler } = require("../../utils/async-handler");
const { register, login, logout } = require("./auth.service");

const registerHandler = asyncHandler(async (req, res) => {
  const result = await register(req.body);

  res.status(201).json({
    message: "Register successful",
    data: result,
  });
});

const loginHandler = asyncHandler(async (req, res) => {
  const { emailAddress, password } = req.body;

  const result = await login({ emailAddress, password });

  res.status(200).json({
    message: "Login successful",
    data: result,
  });
});

const logoutHandler = asyncHandler(async (_req, res) => {
  const result = await logout();

  res.status(200).json(result);
});

module.exports = { registerHandler, loginHandler, logoutHandler };
