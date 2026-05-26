const { asyncHandler } = require("../../utils/async-handler");
const {
  createGroup,
  listGroups,
  addFriendToGroup,
  removeFriendFromGroup,
  getGroupMembers,
  editGroupPermissions,
} = require("./group.service");

const createGroupHandler = asyncHandler(async (req, res) => {
  const data = await createGroup(req.user.sub, req.body);

  res.status(201).json({
    message: "Group created successfully",
    data,
  });
});

const listGroupsHandler = asyncHandler(async (req, res) => {
  const data = await listGroups(req.user.sub);

  res.status(200).json({
    message: "Groups fetched successfully",
    data,
  });
});

const addFriendToGroupHandler = asyncHandler(async (req, res) => {
  const data = await addFriendToGroup(req.user.sub, req.params.groupId, req.body.emailAddress);

  res.status(200).json({
    message: "Friend added to group successfully",
    data,
  });
});

const removeFriendFromGroupHandler = asyncHandler(async (req, res) => {
  const data = await removeFriendFromGroup(req.user.sub, req.params.groupId, req.params.userId);

  res.status(200).json({
    message: "Friend removed from group successfully",
    data,
  });
});

const getGroupMembersHandler = asyncHandler(async (req, res) => {
  const data = await getGroupMembers(req.user.sub, req.params.groupId);

  res.status(200).json({
    message: "Group members fetched successfully",
    data,
  });
});

const editGroupPermissionsHandler = asyncHandler(async (req, res) => {
  const data = await editGroupPermissions(req.user.sub, req.params.groupId, req.body);

  res.status(200).json({
    message: "Group permissions updated successfully",
    data,
  });
});

module.exports = {
  createGroupHandler,
  listGroupsHandler,
  addFriendToGroupHandler,
  removeFriendFromGroupHandler,
  getGroupMembersHandler,
  editGroupPermissionsHandler,
};
