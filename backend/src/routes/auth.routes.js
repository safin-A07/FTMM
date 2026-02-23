const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  sessionExchange,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.get("/session-exchange", sessionExchange);

module.exports = router;
