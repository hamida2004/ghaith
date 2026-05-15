const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// =========================
// CONVERSATION
// One thread per user.
// Any admin can see unassigned threads.
// The first admin to reply becomes the assigned admin.
// =========================
const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // =========================
    // RELATIONS
    // =========================

    // The user who opened the conversation (donator or seeker)
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // NULL until an admin replies — first admin to reply claims it
    assigned_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    // =========================
    // META
    // =========================
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

    // =========================
    // STATUS
    // =========================
    // open   → active conversation
    // closed → admin or user closed it
    status: {
      type: DataTypes.ENUM("open", "closed"),
      allowNull: false,
      defaultValue: "open"
    }
  },
  {
    timestamps: true,
    tableName: "Conversations"
  }
);

module.exports = Conversation;