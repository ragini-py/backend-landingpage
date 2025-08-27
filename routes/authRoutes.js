const express = require("express");
const { login, register, forgotPassword, resetPassword } = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/register", register);

// ✅ Forgot / Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
