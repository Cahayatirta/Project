const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const { meHandler } = require("./user.controller");

const router = express.Router();

router.get("/me", authenticate, meHandler);

module.exports = router;
