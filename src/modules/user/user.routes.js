const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const { meHandler, profileHandler, updateProfileHandler } = require("./user.controller");

const router = express.Router();

router.get("/me", authenticate, meHandler);
router.get("/:userId/profile", authenticate, profileHandler);
router.patch("/profile", authenticate, updateProfileHandler);

module.exports = router;
