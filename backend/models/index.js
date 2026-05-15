const User = require("./user.model");
const Request = require("./request.model");
const Donation = require("./donation.model");
const Category = require("./category.model");
const Document = require("./document.model");

const Conversation = require("./conversation.model");
const Message = require("./message.model");

const sequelize = require("../config/db");

// =====================
// USER ↔ REQUEST
// =====================

// seeker
User.hasMany(Request, {
  foreignKey: "seeker_id",
  as: "Requests"
});

Request.belongsTo(User, {
  foreignKey: "seeker_id",
  as: "Seeker"
});

// =====================
// USER ↔ DONATION
// =====================

// donor
User.hasMany(Donation, {
  foreignKey: "donor_id",
  as: "Donations"
});

Donation.belongsTo(User, {
  foreignKey: "donor_id",
  as: "Donor"
});

// =====================
// REQUEST ↔ DONATION
// =====================

Request.hasMany(Donation, {
  foreignKey: "request_id",
  as: "Donations"
});

Donation.belongsTo(Request, {
  foreignKey: "request_id",
  as: "Request"
});

// =====================
// DONATION SELF RELATIONS
// =====================

// parent donation → dispatches
Donation.hasMany(Donation, {
  foreignKey: "parent_id",
  as: "Dispatches"
});

// child dispatch → parent donation
Donation.belongsTo(Donation, {
  foreignKey: "parent_id",
  as: "ParentDonation"
});

// =====================
// CATEGORY ↔ REQUEST
// =====================

Category.hasMany(Request, {
  foreignKey: "category_id",
  as: "Requests"
});

Request.belongsTo(Category, {
  foreignKey: "category_id",
  as: "Category"
});

// =====================
// USER ↔ DOCUMENT
// =====================

User.hasMany(Document, {
  foreignKey: "user_id",
  as: "Documents"
});

Document.belongsTo(User, {
  foreignKey: "user_id",
  as: "User"
});

// =====================
// USER ↔ CONVERSATION
// =====================

// user conversations
User.hasMany(Conversation, {
  foreignKey: "user_id",
  as: "Conversations"
});

Conversation.belongsTo(User, {
  foreignKey: "user_id",
  as: "User"
});

// assigned admin conversations
User.hasMany(Conversation, {
  foreignKey: "assigned_admin_id",
  as: "AssignedConversations"
});

Conversation.belongsTo(User, {
  foreignKey: "assigned_admin_id",
  as: "AssignedAdmin"
});

// =====================
// CONVERSATION ↔ MESSAGE
// =====================

Conversation.hasMany(Message, {
  foreignKey: "conversation_id",
  as: "Messages"
});

Message.belongsTo(Conversation, {
  foreignKey: "conversation_id",
  as: "Conversation"
});

// =====================
// USER ↔ MESSAGE
// =====================

User.hasMany(Message, {
  foreignKey: "sender_id",
  as: "SentMessages"
});

Message.belongsTo(User, {
  foreignKey: "sender_id",
  as: "Sender"
});

// =====================
// EXPORTS
// =====================

module.exports = {
  User,
  Request,
  Donation,
  Category,
  Document,
  Conversation,
  Message,
  sequelize
};