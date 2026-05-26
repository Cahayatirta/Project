const { ApiError } = require("../../utils/api-error");
const { findSocialBetweenUsers, findUserByEmail } = require("../social/social.repository");
const {
  createGroupWithDefaults,
  createDefaultGroupForUser,
  findGroupById,
  findDefaultGroupByOwnerId,
  findGroupMember,
  addGroupMember,
  addGroupMemberIfNotExists,
  removeGroupMember,
  listGroupMembers,
  listGroupsByOwnerId,
  updateGroupPermission,
} = require("./group.repository");

const ensureGroupOwner = async (groupId, ownerId) => {
  const group = await findGroupById(groupId);

  if (!group || group.id_user !== ownerId) {
    throw new ApiError(404, "Group not found");
  }

  return group;
};

const mapGroupPermission = (permission) => ({
  canViewScreenTime: permission.can_view_screen_time,
  canViewSleepHours: permission.can_view_sleep_hours,
  canViewWellnessIndex: permission.can_view_wellness_index,
  canViewSleepQuality: permission.can_view_sleep_quality,
  canViewFatigueScore: permission.can_view_fatigue_score,
  canViewDigitalBalance: permission.can_view_digital_balance,
  canViewScreenTimeCategory: permission.can_view_screen_time_category,
  canViewPhysicalActivity: permission.can_view_physical_activity,
  canViewCaffeineIntake: permission.can_view_caffeine_intake,
  canViewWorkHours: permission.can_view_work_hours,
  canViewMood: permission.can_view_mood,
});

const mapGroup = (group) => ({
  id: group.id,
  ownerId: group.id_user,
  groupName: group.group_name,
  description: group.description,
  isDefault: Boolean(group.is_default),
  memberCount: Number(group.member_count || 0),
  permissions: mapGroupPermission(group),
  createdAt: group.created_at,
  updatedAt: group.updated_at,
});

const createGroup = async (ownerId, payload) => {
  if (!payload.groupName) {
    throw new ApiError(400, "Validation failed", [
      { property: "groupName", message: "Group name is required" },
    ]);
  }

  const group = await createGroupWithDefaults(
    ownerId,
    payload.groupName,
    payload.description ?? null
  );

  return {
    id: group.id,
    ownerId: group.id_user,
    groupName: group.group_name,
    description: group.description,
    isDefault: Boolean(group.is_default),
    createdAt: group.created_at,
    updatedAt: group.updated_at,
  };
};

const ensureDefaultFriendGroup = async (ownerId) => {
  const existing = await findDefaultGroupByOwnerId(ownerId);

  if (existing) {
    return existing;
  }

  return createDefaultGroupForUser(ownerId);
};

const syncAcceptedFriendToDefaultGroup = async (ownerId, friendId) => {
  const defaultGroup = await ensureDefaultFriendGroup(ownerId);
  await addGroupMemberIfNotExists(defaultGroup.id, friendId);
  return defaultGroup;
};

const addFriendToGroup = async (ownerId, groupId, emailAddress) => {
  await ensureGroupOwner(groupId, ownerId);

  const user = await findUserByEmail(emailAddress);

  if (!user) {
    throw new ApiError(404, "Friend not found");
  }

  const relation = await findSocialBetweenUsers(ownerId, user.id);

  if (!relation || relation.status !== "accepted") {
    throw new ApiError(400, "User is not your accepted friend", [
      { property: "emailAddress", message: "Only accepted friends can be added to a group" },
    ]);
  }

  const existing = await findGroupMember(groupId, user.id);

  if (existing) {
    throw new ApiError(409, "Friend already in group");
  }

  await addGroupMember(groupId, user.id);

  return {
    groupId,
    member: {
      id: user.id,
      name: user.name,
      emailAddress: user.email_address,
    },
  };
};

const listGroups = async (ownerId) => {
  await ensureDefaultFriendGroup(ownerId);
  const groups = await listGroupsByOwnerId(ownerId);
  return groups.map(mapGroup);
};

const removeFriendFromGroup = async (ownerId, groupId, userId) => {
  const group = await ensureGroupOwner(groupId, ownerId);

  if (group.id_user === userId) {
    throw new ApiError(400, "Group owner cannot be removed");
  }

  const member = await findGroupMember(groupId, userId);

  if (!member) {
    throw new ApiError(404, "Group member not found");
  }

  await removeGroupMember(groupId, userId);
  return { groupId, userId };
};

const getGroupMembers = async (ownerId, groupId) => {
  await ensureGroupOwner(groupId, ownerId);
  const members = await listGroupMembers(groupId);

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    emailAddress: member.email_address,
    joinedAt: member.created_at,
  }));
};

const editGroupPermissions = async (ownerId, groupId, payload) => {
  await ensureGroupOwner(groupId, ownerId);

  const permission = await updateGroupPermission(groupId, {
    can_view_screen_time: payload.canViewScreenTime,
    can_view_sleep_hours: payload.canViewSleepHours,
    can_view_wellness_index: payload.canViewWellnessIndex,
    can_view_sleep_quality: payload.canViewSleepQuality,
    can_view_fatigue_score: payload.canViewFatigueScore,
    can_view_digital_balance: payload.canViewDigitalBalance,
    can_view_screen_time_category: payload.canViewScreenTimeCategory,
    can_view_physical_activity: payload.canViewPhysicalActivity,
    can_view_caffeine_intake: payload.canViewCaffeineIntake,
    can_view_work_hours: payload.canViewWorkHours,
    can_view_mood: payload.canViewMood,
  });

  return {
    id: permission.id,
    groupId: permission.id_group,
    ...mapGroupPermission(permission),
    createdAt: permission.created_at,
    updatedAt: permission.updated_at,
  };
};

module.exports = {
  createGroup,
  ensureDefaultFriendGroup,
  syncAcceptedFriendToDefaultGroup,
  addFriendToGroup,
  removeFriendFromGroup,
  listGroups,
  getGroupMembers,
  editGroupPermissions,
};
