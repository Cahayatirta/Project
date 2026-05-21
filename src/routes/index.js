const express = require("express");

const activityRoutes = require("../modules/activity/activity.routes");
const authRoutes = require("../modules/auth/auth.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const groupRoutes = require("../modules/group/group.routes");
const socialRoutes = require("../modules/social/social.routes");
const userRoutes = require("../modules/user/user.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/activities", activityRoutes);
router.use("/social", socialRoutes);
router.use("/groups", groupRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
