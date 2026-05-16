const { asyncHandler } = require("../../utils/async-handler");
const { register, login } = require("./auth.service");

const registerHandler = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const result = await register({ fullName, email, password, role });

  res.status(201).json({
    message: "Register successful",
    data: result,
  });
});

const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await login({ email, password });

  res.status(200).json({
    message: "Login successful",
    data: result,
  });
});

module.exports = { registerHandler, loginHandler };
