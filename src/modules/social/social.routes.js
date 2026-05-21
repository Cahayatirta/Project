const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const {
  addFriendHandler,
  getFriendRequestsHandler,
  acceptFriendHandler,
  rejectFriendHandler,
  blockFriendHandler,
  listFriendsHandler,
  getFriendStatsHandler,
  getFriendAveragesByPermissionHandler,
} = require("./social.controller");

const router = express.Router();

router.use(authenticate);
router.post("/friends", addFriendHandler);
router.get("/friends/requests", getFriendRequestsHandler);
router.post("/friends/:socialId/accept", acceptFriendHandler);
router.post("/friends/:socialId/reject", rejectFriendHandler);
router.post("/friends/block", blockFriendHandler);
router.get("/friends", listFriendsHandler);
router.get("/friends/stats", getFriendStatsHandler);
router.get("/friends/averages", getFriendAveragesByPermissionHandler);

module.exports = router;
