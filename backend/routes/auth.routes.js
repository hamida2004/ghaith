const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// PUBLIC
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/request-reset", authController.requestReset);
router.post("/reset-password", authController.resetPassword);

// PROTECTED
router.get("/me", verifyToken, authController.me);

// ADMIN EXAMPLE
router.get("/admin-test", verifyToken, isAdmin, (req, res) => {
  res.json({ msg: "Admin access granted" });
});

module.exports = router;