const { asyncHandler } = require("../../utils/async-handler");
const { getCurrentUser, getUserProfile, updateCurrentUser } = require("./user.service");

const meHandler = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.sub);

  res.status(200).json({
    message: "Current user fetched successfully",
    data: user,
  });
});

const profileHandler = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.params.userId);

  res.status(200).json({
    message: "User profile fetched successfully",
    data: user,
  });
});

const updateProfileHandler = asyncHandler(async (req, res) => {
  const user = await updateCurrentUser(req.user.sub, req.body);

  res.status(200).json({
    message: "Profile updated successfully",
    data: user,
  });
});

module.exports = { meHandler, profileHandler, updateProfileHandler };
