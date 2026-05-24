const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const { meHandler, profileHandler, updateProfileHandler } = require("./user.controller");
const { validateUpdateProfile } = require("./user.validation");

const router = express.Router();

router.get("/me", authenticate, meHandler);
router.get("/:userId/profile", authenticate, profileHandler);
router.patch("/profile", authenticate, validateUpdateProfile, updateProfileHandler);

module.exports = router;
