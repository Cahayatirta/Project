const { asyncHandler } = require("../../utils/async-handler");
const {
  addActivity,
  updateActivity,
  getActivities,
  getAverageFactors,
  getMonthlyHistories,
  getMonthlyHistoryDetail,
} = require("./activity.service");

const addActivityHandler = asyncHandler(async (req, res) => {
  const data = await addActivity(req.user.sub, req.body);

  res.status(201).json({
    message: "Activity created successfully",
    data,
  });
});

const getActivitiesHandler = asyncHandler(async (req, res) => {
  const data = await getActivities(req.user.sub, req.query);

  res.status(200).json({
    message: "Activities fetched successfully",
    data,
  });
});

const updateActivityHandler = asyncHandler(async (req, res) => {
  const data = await updateActivity(req.user.sub, req.params.activityId, req.body);

  res.status(200).json({
    message: "Activity updated successfully",
    data,
  });
});

const getAverageFactorsHandler = asyncHandler(async (req, res) => {
  const data = await getAverageFactors(req.user.sub, req.query);

  res.status(200).json({
    message: "Average factors fetched successfully",
    data,
  });
});

const getMonthlyHistoriesHandler = asyncHandler(async (req, res) => {
  const data = await getMonthlyHistories(req.user.sub);

  res.status(200).json({
    message: "Monthly histories fetched successfully",
    data,
  });
});

const getMonthlyHistoryDetailHandler = asyncHandler(async (req, res) => {
  const data = await getMonthlyHistoryDetail(req.user.sub, req.query);

  res.status(200).json({
    message: "Monthly history detail fetched successfully",
    data,
  });
});

module.exports = {
  addActivityHandler,
  getActivitiesHandler,
  updateActivityHandler,
  getAverageFactorsHandler,
  getMonthlyHistoriesHandler,
  getMonthlyHistoryDetailHandler,
};
