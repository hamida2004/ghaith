const router = require("express").Router();
const controller = require("../controllers/request.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// =========================
// CREATE REQUEST (USER)
// =========================
router.post("/", verifyToken, controller.createRequest);

// =========================
// GET ALL REQUESTS
// =========================
router.get("/", verifyToken, controller.getRequests);

// =========================
// GET MY REQUESTS
// =========================
router.get("/me", verifyToken, controller.getMyRequests);

// =========================
// ADMIN: UPDATE REQUEST STATUS
// =========================
router.patch("/:id/status", verifyToken, isAdmin, controller.updateStatus);

module.exports = router;