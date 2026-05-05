const router = require("express").Router();
const controller = require("../controllers/user.controller");
const upload = require("../middleware/upload.middleware");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// USER
router.get("/me", verifyToken, controller.getMe);
router.put("/me", verifyToken, controller.updateMe);
router.post("/upload", verifyToken, upload.single("document"), controller.uploadDocument);

// ADMIN
router.get("/", verifyToken, isAdmin, controller.getUsers);
router.patch("/:id/status", verifyToken, isAdmin, controller.updateStatus);
router.patch("/:id/admin", verifyToken, isAdmin, controller.toggleAdmin);
router.patch("/document/:id", verifyToken, isAdmin, controller.updateDocumentStatus);
// USER
router.post("/request-admin", verifyToken, controller.requestAdmin);

// ADMIN
router.patch("/admin-request/:id", verifyToken, isAdmin, controller.handleAdminRequest);
module.exports = router;

// ADMIN: GET ADMIN REQUESTS
router.get(
  "/admin-requests",
  verifyToken,
  isAdmin,
  controller.getAdminRequests
);