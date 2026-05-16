const { asyncHandler } = require("../../utils/async-handler");
const { getCurrentUser } = require("./user.service");

const meHandler = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.sub);

  res.status(200).json({
    message: "Current user fetched successfully",
    data: user,
  });
});

module.exports = { meHandler };
