const { asyncHandler } = require("../../utils/async-handler");
const {
  getDashboardOverview,
  getDashboardDailyActivity,
  getStressSummary,
  getActivityRecommendation,
} = require("./dashboard.service");

const getDashboardOverviewHandler = asyncHandler(async (req, res) => {
  const data = await getDashboardOverview(req.user.sub, req.query);

  res.status(200).json({
    message: "Dashboard overview fetched successfully",
    data,
  });
});

const getDashboardDailyActivityHandler = asyncHandler(async (req, res) => {
  const data = await getDashboardDailyActivity(req.user.sub, req.query);

  res.status(200).json({
    message: "Dashboard daily activity fetched successfully",
    data,
  });
});

const getStressSummaryHandler = asyncHandler(async (req, res) => {
  const data = await getStressSummary(req.user.sub, req.query);

  res.status(200).json({
    message: "Stress summary fetched successfully",
    data,
  });
});

const getActivityRecommendationHandler = asyncHandler(async (req, res) => {
  const data = await getActivityRecommendation(req.user.sub, req.query);

  res.status(200).json({
    message: "Activity recommendation fetched successfully",
    data,
  });
});

module.exports = {
  getDashboardOverviewHandler,
  getDashboardDailyActivityHandler,
  getStressSummaryHandler,
  getActivityRecommendationHandler,
};
