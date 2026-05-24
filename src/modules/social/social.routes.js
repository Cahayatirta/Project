const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const { validateEmailAddressBody, validateFriendAveragesQuery } = require("./social.validation");
const {
  addFriendHandler,
  getFriendRequestsHandler,
  acceptFriendHandler,
  rejectFriendHandler,
  blockFriendHandler,
  listFriendsHandler,
  getFriendStatsHandler,
  getFriendAveragesByPermissionHandler,
  getFriendHistoryDetailHandler,
} = require("./social.controller");

const router = express.Router();

router.use(authenticate);
router.post("/friends", validateEmailAddressBody, addFriendHandler);
router.get("/friends/requests", getFriendRequestsHandler);
router.post("/friends/:socialId/accept", acceptFriendHandler);
router.post("/friends/:socialId/reject", rejectFriendHandler);
router.post("/friends/block", validateEmailAddressBody, blockFriendHandler);
router.get("/friends", listFriendsHandler);
router.get("/friends/stats", getFriendStatsHandler);
router.get("/friends/averages", validateFriendAveragesQuery, getFriendAveragesByPermissionHandler);
router.get("/friends/:friendId", getFriendHistoryDetailHandler);

module.exports = router;
