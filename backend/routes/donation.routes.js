const router = require("express").Router();
const controller = require("../controllers/donation.controller");
const {
  verifyToken,
  isDonator,
  isSeeker,
  isAdmin
} = require("../middleware/auth.middleware");

// =========================
// CREATE DONATION
// Donator can now omit request_id (free donation)
// =========================
router.post("/", verifyToken, isDonator, controller.createDonation);

// =========================
// GET MY DONATIONS (DONOR)
// Returns root donations + child dispatches nested inside
// =========================
router.get("/me", verifyToken, isDonator, controller.getMyDonations);

// =========================
// GET ALL DONATIONS (ADMIN)
// =========================
router.get("/all", verifyToken, isAdmin, controller.getAllDonations);

// =========================
// GET FREE DONATIONS AWAITING DISPATCH (ADMIN)
// Donations approved but not yet assigned to any request
// =========================
router.get(
  "/unassigned",
  verifyToken,
  isAdmin,
  controller.getUnassignedDonations
);

// =========================
// GET PENDING DONATIONS (SEEKER)
// =========================
router.get("/pending", verifyToken, isSeeker, controller.getPendingDonations);

// =========================
// SEEKER: CONFIRM / REJECT RECEIPT
// =========================
router.patch("/:id/status", verifyToken, isSeeker, controller.updateDonationStatus);

// =========================
// ADMIN: APPROVE / REJECT any donation
// For targeted:  pending_admin → pending_seeker | rejected
// For free:      pending_admin → pending_assignment | rejected
// =========================
router.patch("/admin/:id", verifyToken, isAdmin, controller.adminValidateDonation);

// =========================
// ADMIN: DISPATCH a free donation to a specific request
// Creates a child donation linked to the chosen request
// Body: { request_id, allocated_amount, notes? }
// =========================
router.post(
  "/admin/:id/dispatch",
  verifyToken,
  isAdmin,
  controller.dispatchDonation
);

module.exports = router;