const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const { validateActivityPayload } = require("./activity.validation");
const {
  addActivityHandler,
  getActivitiesHandler,
  updateActivityHandler,
  getAverageFactorsHandler,
  getMonthlyHistoriesHandler,
  getMonthlyHistoryDetailHandler,
} = require("./activity.controller");

const router = express.Router();

router.use(authenticate);
router.post("/", validateActivityPayload, addActivityHandler);
router.get("/months", getMonthlyHistoriesHandler);
router.get("/months/detail", getMonthlyHistoryDetailHandler);
router.get("/", getActivitiesHandler);
router.get("/averages/factors", getAverageFactorsHandler);
router.patch("/:activityId", validateActivityPayload, updateActivityHandler);

module.exports = router;
