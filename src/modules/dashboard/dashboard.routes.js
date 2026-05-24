const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const {
  getDashboardOverviewHandler,
  getDashboardDailyActivityHandler,
  getStressSummaryHandler,
  getActivityRecommendationHandler,
} = require("./dashboard.controller");

const router = express.Router();

router.use(authenticate);
router.get("/", getDashboardOverviewHandler);
router.get("/activity/daily", getDashboardDailyActivityHandler);
router.get("/stress-summary", getStressSummaryHandler);
router.get("/recommendation", getActivityRecommendationHandler);

module.exports = router;
