const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const {
  createGroupHandler,
  addFriendToGroupHandler,
  removeFriendFromGroupHandler,
  getGroupMembersHandler,
  editGroupPermissionsHandler,
} = require("./group.controller");

const router = express.Router();

router.use(authenticate);
router.post("/", createGroupHandler);
router.post("/:groupId/members", addFriendToGroupHandler);
router.delete("/:groupId/members/:userId", removeFriendFromGroupHandler);
router.get("/:groupId/members", getGroupMembersHandler);
router.patch("/:groupId/permissions", editGroupPermissionsHandler);

module.exports = router;
