const express = require("express");

const { authenticate } = require("../../middlewares/auth.middleware");
const { loginHandler, logoutHandler, registerHandler } = require("./auth.controller");
const { validateLogin, validateRegister } = require("./auth.validation");

const router = express.Router();

router.post("/register", validateRegister, registerHandler);
router.post("/login", validateLogin, loginHandler);
router.post("/logout", authenticate, logoutHandler);

module.exports = router;
