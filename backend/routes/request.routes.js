console.log("Request routes loaded");


const router = require("express").Router();
const controller = require("../controllers/request.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

router.post("/", verifyToken, controller.createRequest);
router.get("/", verifyToken, controller.getRequests);
router.get("/me", verifyToken, controller.getMyRequests);

// ADMIN
router.patch("/:id/status", verifyToken, isAdmin, controller.updateStatus);

module.exports = router;