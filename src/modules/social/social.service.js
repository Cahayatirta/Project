const { ApiError } = require("../../utils/api-error");
const { resolveDateRange } = require("../../utils/period");
const { getMonthlyHistoryDetail } = require("../activity/activity.service");
const { syncAcceptedFriendToDefaultGroup } = require("../group/group.service");
const {
  titleCaseStatus,
  toStressPercent,
  formatRelativeTime,
  normalizeDateValue,
} = require("../../utils/presentation");
const { classifyStressLevel } = require("../../utils/stress");
const {
  findUserByEmail,
  findSocialBetweenUsers,
  findSocialById,
  createFriendRequest,
  updateSocialStatus,
  getPendingRequests,
  getAcceptedFriends,
  getAcceptedFriendById,
  getFriendStats,
  getPermittedFriendAverages,
} = require("./social.repository");

const mapSocial = (row) => ({
  id: row.id,
  sender: {
    id: row.user_sender_id,
    name: row.sender_name,
    username: row.sender_username,
    emailAddress: row.sender_email_address,
  },
  receiver: {
    id: row.user_receiver_id,
    name: row.receiver_name,
    username: row.receiver_username,
    emailAddress: row.receiver_email_address,
  },
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const sendFriendRequest = async (userId, emailAddress) => {
  const targetUser = await findUserByEmail(emailAddress);

  if (!targetUser) {
    throw new ApiError(404, "Target user not found");
  }

  if (targetUser.id === userId) {
    throw new ApiError(400, "You cannot add yourself");
  }

  const existing = await findSocialBetweenUsers(userId, targetUser.id);

  if (existing) {
    if (existing.status === "accepted") {
      return {
        id: existing.id,
        status: "accepted",
        isNew: false,
        friend: {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username,
          emailAddress,
        },
      };
    }

    if (existing.status === "pending") {
      return {
        id: existing.id,
        status: "pending",
        isNew: false,
        friend: {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username,
          emailAddress,
        },
      };
    }

    if (["declined", "blocked"].includes(existing.status)) {
      await updateSocialStatus(existing.id, "pending");

      return {
        id: existing.id,
        status: "pending",
        isNew: false,
        friend: {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username,
          emailAddress,
        },
      };
    }
  }

  const created = await createFriendRequest(userId, targetUser.id);

  return {
    id: created.id,
    status: "pending",
    isNew: true,
    friend: {
      id: targetUser.id,
      name: targetUser.name,
      username: targetUser.username,
      emailAddress,
    },
  };
};

const updateFriendRequest = async (userId, socialId, status) => {
  const relation = await findSocialById(socialId);

  if (!relation || relation.user_receiver_id !== userId) {
    throw new ApiError(404, "Friend request not found");
  }

  if (relation.status === status) {
    return { id: socialId, status };
  }

  if (relation.status === "accepted" && status === "accepted") {
    return { id: socialId, status: "accepted" };
  }

  if (relation.status !== "pending") {
    throw new ApiError(400, `Friend request cannot be ${status} from status ${relation.status}`);
  }

  const requests = await getPendingRequests(userId);
  const request = requests.find((item) => item.id === socialId);

  if (!request) {
    throw new ApiError(404, "Friend request not found");
  }

  await updateSocialStatus(socialId, status);

  if (status === "accepted") {
    await Promise.all([
      syncAcceptedFriendToDefaultGroup(userId, relation.user_sender_id),
      syncAcceptedFriendToDefaultGroup(relation.user_sender_id, userId),
    ]);
  }

  return { id: socialId, status };
};

const blockFriend = async (userId, friendEmailAddress) => {
  const targetUser = await findUserByEmail(friendEmailAddress);

  if (!targetUser) {
    throw new ApiError(404, "Target user not found");
  }

  const relation = await findSocialBetweenUsers(userId, targetUser.id);

  if (!relation) {
    throw new ApiError(404, "Friend relation not found");
  }

  await updateSocialStatus(relation.id, "blocked");
  return { id: relation.id, status: "blocked" };
};

const listPendingRequests = async (userId) => {
  const items = await getPendingRequests(userId);
  return items.map(mapSocial);
};

const listFriends = async (userId) => {
  const items = await getAcceptedFriends(userId);
  const friends = items.map((item) => ({
    id: item.friend_id,
    name: item.friend_name,
    username: item.friend_username,
    emailAddress: item.friend_email_address,
    friendshipId: item.id,
    status: item.status,
    biodata: item.friend_biodata,
    job: item.friend_job,
    workLocation: item.friend_work_location,
    hobby: item.friend_hobby,
    stressStatus: item.last_stress_level === null ? "No Activity" : titleCaseStatus(classifyStressLevel(item.last_stress_level)),
    time: formatRelativeTime(item.last_activity_created_at),
    lastActivityDate: normalizeDateValue(item.last_activity_date),
    stressLevel: item.last_stress_level === null ? 0 : toStressPercent(item.last_stress_level),
    createdAt: item.created_at,
  }));

  return friends;
};

const getFriendListStats = async (userId) => {
  const stats = await getFriendStats(userId);

  return {
    totalFriend: Number(stats.total_friend || 0),
    totalRefreshedFriend: Number(stats.total_refreshed_friend || 0),
    totalNearBurnoutFriend: Number(stats.total_near_burnout_friend || 0),
  };
};

const getFriendAveragesByPermission = async (userId, query) => {
  if (!query.groupId) {
    throw new ApiError(400, "Validation failed", [
      { property: "groupId", message: "Group ID is required" },
    ]);
  }

  const range = resolveDateRange(query);
  const rows = await getPermittedFriendAverages(userId, query.groupId, range.startDate, range.endDate);

  return {
    period: range.period,
    range,
    items: rows.map((row) => {
      const factors = {};

      if (row.can_view_screen_time) factors.screenTime = Number(row.avg_screen_time || 0);
      if (row.can_view_sleep_hours) factors.sleepHours = Number(row.avg_sleep_hours || 0);
      if (row.can_view_wellness_index) factors.wellnessIndex = Number(row.avg_wellness_index || 0);
      if (row.can_view_sleep_quality) factors.sleepQuality = Number(row.avg_sleep_quality || 0);
      if (row.can_view_fatigue_score) factors.fatigueScore = Number(row.avg_fatigue_score || 0);
      if (row.can_view_digital_balance) factors.digitalBalance = Number(row.avg_digital_balance || 0);
      if (row.can_view_screen_time_category) factors.screenTimeCategory = row.top_screen_time_category;
      if (row.can_view_physical_activity) factors.physicalActivity = row.top_physical_activity;
      if (row.can_view_caffeine_intake) factors.caffeineIntake = Number(row.avg_caffeine_intake || 0);
      if (row.can_view_work_hours) factors.workHours = Number(row.avg_work_hours || 0);
      if (row.can_view_mood) factors.mood = row.top_mood;

      return {
        friend: {
          id: row.friend_id,
          name: row.friend_name,
          emailAddress: row.friend_email_address,
        },
        factors,
      };
    }),
  };
};

const getSocialOverview = async (userId) => {
  const [stats, friends] = await Promise.all([
    getFriendListStats(userId),
    listFriends(userId),
  ]);

  return {
    summary: [
      { label: "Total Friends", value: stats.totalFriend },
      { label: "Refreshed", value: stats.totalRefreshedFriend },
      { label: "Near-Burnout", value: stats.totalNearBurnoutFriend },
    ],
    friends: friends.map((friend) => ({
      id: friend.id,
      name: friend.name,
      username: friend.username,
      status: friend.stressStatus,
      time: friend.time,
      stressLevel: friend.stressLevel,
      emailAddress: friend.emailAddress,
      lastActivityDate: friend.lastActivityDate,
    })),
    stats,
    items: friends,
  };
};

const getFriendHistoryDetail = async (userId, friendId, query = {}) => {
  const friend = await getAcceptedFriendById(userId, friendId);

  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  const histories = await getMonthlyHistoryDetail(friendId, query);

  return {
    friend: {
      id: friend.friend_id,
      name: friend.friend_name,
      username: friend.friend_username,
      emailAddress: friend.friend_email_address,
      biodata: friend.friend_biodata,
      job: friend.friend_job,
      workLocation: friend.friend_work_location,
      hobby: friend.friend_hobby,
      status: friend.last_stress_level === null ? "No Activity" : titleCaseStatus(classifyStressLevel(friend.last_stress_level)),
      time: formatRelativeTime(friend.last_activity_created_at),
      stressLevel: friend.last_stress_level === null ? 0 : toStressPercent(friend.last_stress_level),
    },
    histories,
  };
};

module.exports = {
  sendFriendRequest,
  updateFriendRequest,
  blockFriend,
  listPendingRequests,
  listFriends,
  getFriendListStats,
  getFriendAveragesByPermission,
  getSocialOverview,
  getFriendHistoryDetail,
};
