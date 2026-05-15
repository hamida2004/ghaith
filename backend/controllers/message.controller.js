const db = require("../models");
const { Op } = require("sequelize");

// =========================
// HELPERS
// =========================

// Shared include for loading a conversation with its participants
const conversationIncludes = [
  {
    model: db.User,
    as: "User",
    attributes: ["id", "name", "email"]
  },
  {
    model: db.User,
    as: "AssignedAdmin",
    attributes: ["id", "name"],
    required: false
  }
];

// Count unread messages from the OTHER side for a given conversation + viewer
async function countUnread(conversationId, viewerSenderRole) {
  // viewer is "admin" → count unread messages where sender_role = "user", and vice versa
  const otherRole = viewerSenderRole === "admin" ? "user" : "admin";
  return db.Message.count({
    where: {
      conversation_id: conversationId,
      sender_role: otherRole,
      is_read: false
    }
  });
}

// =========================
// USER: START CONVERSATION
// Creates a new conversation.
// Users are allowed multiple conversations (e.g. about different topics).
// Body: { subject }
// =========================
exports.startConversation = async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ msg: "Subject is required" });
    }

    const conversation = await db.Conversation.create({
      user_id: req.user.id,
      subject: subject.trim(),
      status: "open"
    });

    res.status(201).json(conversation);
  } catch (err) {
    console.error("START CONVERSATION ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// USER: GET MY CONVERSATIONS
// Returns all conversations the logged-in user opened, newest first.
// =========================
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await db.Conversation.findAll({
      where: { user_id: req.user.id },
      include: conversationIncludes,
      order: [["updatedAt", "DESC"]]
    });

    // Attach unread count (messages from admin side not yet read by user)
    const result = await Promise.all(
      conversations.map(async (c) => {
        const unread = await countUnread(c.id, "admin"); // user reads admin msgs
        return { ...c.toJSON(), unread };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("GET MY CONVERSATIONS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// GET MESSAGES IN A CONVERSATION
// Accessible by the conversation owner OR any admin.
// Marks the other side's messages as read on open.
// =========================
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = !!req.user.is_admin;

    const conversation = await db.Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    // Authorization: owner or any admin
    if (!isAdmin && conversation.user_id !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Mark unread messages from the other side as read
    const otherRole = isAdmin ? "user" : "admin";
    await db.Message.update(
      { is_read: true },
      {
        where: {
          conversation_id: id,
          sender_role: otherRole,
          is_read: false
        }
      }
    );

    const messages = await db.Message.findAll({
      where: { conversation_id: id },
      include: [
        {
          model: db.User,
          as: "Sender",
          attributes: ["id", "name"]
        }
      ],
      order: [["createdAt", "ASC"]]
    });

    res.json({ conversation, messages });
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// SEND MESSAGE
// Works for both user and admin.
// When an admin sends the first message in a conversation,
// they become the assigned admin for that thread.
// Sending a message to a closed conversation reopens it (user only).
// =========================
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;          // conversation id
    const { body } = req.body;
    const isAdmin = !!req.user.is_admin;

    if (!body || !body.trim()) {
      return res.status(400).json({ msg: "Message body is required" });
    }

    const conversation = await db.Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    // Authorization
    if (!isAdmin && conversation.user_id !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Admins cannot message a closed conversation (they close it, user reopens)
    if (isAdmin && conversation.status === "closed") {
      return res.status(400).json({ msg: "Conversation is closed" });
    }

    // If user sends to a closed conversation → reopen it
    if (!isAdmin && conversation.status === "closed") {
      conversation.status = "open";
    }

    // First admin to reply claims the conversation
    if (isAdmin && !conversation.assigned_admin_id) {
      conversation.assigned_admin_id = req.user.id;
    }

    // Touch updatedAt so conversations sort by latest activity
    conversation.changed("updatedAt", true);
    await conversation.save();

    // Create message
    const message = await db.Message.create({
      conversation_id: id,
      sender_id: req.user.id,
      sender_role: isAdmin ? "admin" : "user",
      body: body.trim(),
      is_read: false
    });

    // Return with sender info
    const full = await db.Message.findByPk(message.id, {
      include: [{ model: db.User, as: "Sender", attributes: ["id", "name"] }]
    });

    res.status(201).json(full);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// USER: CLOSE CONVERSATION
// =========================
exports.closeConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await db.Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }
    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    if (conversation.status === "closed") {
      return res.status(400).json({ msg: "Already closed" });
    }

    conversation.status = "closed";
    await conversation.save();

    res.json({ msg: "Conversation closed" });
  } catch (err) {
    console.error("CLOSE CONVERSATION ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// ADMIN: GET ALL CONVERSATIONS
// Returns:
//   - All unassigned open conversations (any admin can claim)
//   - All conversations assigned to THIS admin
// Sorted by latest activity, with unread counts.
// =========================
exports.adminGetConversations = async (req, res) => {
  try {
    const conversations = await db.Conversation.findAll({
      where: {
        [Op.or]: [
          { assigned_admin_id: null, status: "open" }, // unclaimed
          { assigned_admin_id: req.user.id }            // mine
        ]
      },
      include: conversationIncludes,
      order: [["updatedAt", "DESC"]]
    });

    // Attach unread count (messages from user side not yet read by admin)
    const result = await Promise.all(
      conversations.map(async (c) => {
        const unread = await countUnread(c.id, "user"); // admin reads user msgs
        return { ...c.toJSON(), unread };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("ADMIN GET CONVERSATIONS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// ADMIN: CLOSE CONVERSATION
// =========================
exports.adminCloseConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await db.Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }
    if (conversation.status === "closed") {
      return res.status(400).json({ msg: "Already closed" });
    }

    conversation.status = "closed";
    await conversation.save();

    res.json({ msg: "Conversation closed" });
  } catch (err) {
    console.error("ADMIN CLOSE CONVERSATION ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};