const router = require("express").Router();
const controller = require("../controllers/dashboard.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

router.get("/", verifyToken, isAdmin, controller.getStats);

module.exports = router;