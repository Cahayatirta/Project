const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const {
  addActivityHandler,
  getActivitiesHandler,
  updateActivityHandler,
  getAverageFactorsHandler,
} = require("./activity.controller");

const router = express.Router();

router.use(authenticate);
router.post("/", addActivityHandler);
router.get("/", getActivitiesHandler);
router.get("/averages/factors", getAverageFactorsHandler);
router.patch("/:activityId", updateActivityHandler);

module.exports = router;
