const { asyncHandler } = require("../../utils/async-handler");
const {
  sendFriendRequest,
  updateFriendRequest,
  blockFriend,
  listPendingRequests,
  getSocialOverview,
  getFriendListStats,
  getFriendAveragesByPermission,
} = require("./social.service");

const addFriendHandler = asyncHandler(async (req, res) => {
  const data = await sendFriendRequest(req.user.sub, req.body.emailAddress);

  res.status(data.isNew ? 201 : 200).json({
    message: data.status === "accepted" ? "Friend relation already accepted" : "Friend request sent successfully",
    data,
  });
});

const getFriendRequestsHandler = asyncHandler(async (req, res) => {
  const data = await listPendingRequests(req.user.sub);

  res.status(200).json({
    message: "Friend requests fetched successfully",
    data,
  });
});

const acceptFriendHandler = asyncHandler(async (req, res) => {
  const data = await updateFriendRequest(req.user.sub, req.params.socialId, "accepted");

  res.status(200).json({
    message: "Friend request accepted successfully",
    data,
  });
});

const rejectFriendHandler = asyncHandler(async (req, res) => {
  const data = await updateFriendRequest(req.user.sub, req.params.socialId, "declined");

  res.status(200).json({
    message: "Friend request rejected successfully",
    data,
  });
});

const blockFriendHandler = asyncHandler(async (req, res) => {
  const data = await blockFriend(req.user.sub, req.body.emailAddress);

  res.status(200).json({
    message: "Friend blocked successfully",
    data,
  });
});

const listFriendsHandler = asyncHandler(async (req, res) => {
  const data = await getSocialOverview(req.user.sub);

  res.status(200).json({
    message: "Friends fetched successfully",
    data,
  });
});

const getFriendStatsHandler = asyncHandler(async (req, res) => {
  const data = await getFriendListStats(req.user.sub);

  res.status(200).json({
    message: "Friend stats fetched successfully",
    data,
  });
});

const getFriendAveragesByPermissionHandler = asyncHandler(async (req, res) => {
  const data = await getFriendAveragesByPermission(req.user.sub, req.query);

  res.status(200).json({
    message: "Friend averages fetched successfully",
    data,
  });
});

module.exports = {
  addFriendHandler,
  getFriendRequestsHandler,
  acceptFriendHandler,
  rejectFriendHandler,
  blockFriendHandler,
  listFriendsHandler,
  getFriendStatsHandler,
  getFriendAveragesByPermissionHandler,
};
