const router = require("express").Router();
const controller = require("../controllers/donation.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// =========================
// CREATE DONATION
// =========================
router.post("/", verifyToken, controller.createDonation);

// =========================
// GET MY DONATIONS (DONOR)
// =========================
router.get("/me", verifyToken, controller.getMyDonations);

// =========================
// GET PENDING DONATIONS (SEEKER)
// =========================
router.get("/pending", verifyToken, controller.getPendingDonations);

// =========================
// CONFIRM / REJECT DONATION (SEEKER)
// =========================
router.patch("/:id/status", verifyToken, controller.updateDonationStatus);

module.exports = router;