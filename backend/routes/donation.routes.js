const router = require("express").Router();
const controller = require("../controllers/donation.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/", verifyToken, controller.createDonation);
router.get("/me", verifyToken, controller.getMyDonations);

module.exports = router;