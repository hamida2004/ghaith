const router = require("express").Router();
const controller = require("../controllers/message.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// =========================
// USER ROUTES
// (donator or seeker — any authenticated user)
// =========================

// Start a new conversation (or get existing open one)
router.post("/conversations", verifyToken, controller.startConversation);

// Get my conversation list (users typically have one at a time)
router.get("/conversations/me", verifyToken, controller.getMyConversations);

// Get messages inside a conversation (user must own it)
router.get("/conversations/:id/messages", verifyToken, controller.getMessages);

// Send a message (user or admin — ownership checked inside)
router.post("/conversations/:id/messages", verifyToken, controller.sendMessage);

// User closes their own conversation
router.patch("/conversations/:id/close", verifyToken, controller.closeConversation);

// =========================
// ADMIN ROUTES
// =========================

// All conversations (unassigned + assigned to this admin)
router.get("/admin/conversations", verifyToken, isAdmin, controller.adminGetConversations);

// Admin closes a conversation
router.patch("/admin/conversations/:id/close", verifyToken, isAdmin, controller.adminCloseConversation);

module.exports = router;