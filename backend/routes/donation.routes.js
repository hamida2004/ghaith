const router = require("express").Router();
const controller = require("../controllers/donation.controller");
const { verifyToken, isDonator, isSeeker, isAdmin } = require("../middleware/auth.middleware");

// =========================
// CREATE DONATION
// =========================
router.post("/", verifyToken,isDonator, controller.createDonation);

// =========================
// GET MY DONATIONS (DONOR)
// =========================
router.get("/me", verifyToken,isDonator, controller.getMyDonations);

// =========================
// GET PENDING DONATIONS (SEEKER)
// =========================
router.get("/pending", verifyToken,isSeeker, controller.getPendingDonations);

// =========================
// CONFIRM / REJECT DONATION (SEEKER)
// =========================
router.patch("/:id/status", verifyToken, isSeeker,controller.updateDonationStatus);
// ADMIN VALIDATION
router.patch(
  "/admin/:id",
  verifyToken,
  isAdmin,
  controller.adminValidateDonation
);

module.exports = router;