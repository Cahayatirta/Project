const express = require("express");

const { loginHandler, registerHandler } = require("./auth.controller");
const { validateLogin, validateRegister } = require("./auth.validation");

const router = express.Router();

router.post("/register", validateRegister, registerHandler);
router.post("/login", validateLogin, loginHandler);

module.exports = router;
