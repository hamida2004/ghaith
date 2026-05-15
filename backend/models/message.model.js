const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// =========================
// MESSAGE
// Each message inside a conversation.
// sender_role distinguishes who wrote it so the UI can align bubbles.
// =========================
const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // =========================
    // RELATIONS
    // =========================
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // The user who wrote this message (admin or regular user)
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // =========================
    // ROLE SNAPSHOT
    // Stored so the UI always knows which side sent it,
    // even if roles change later.
    // =========================
    sender_role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false
    },

    // =========================
    // CONTENT
    // =========================
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    // =========================
    // READ TRACKING
    // The other party marks messages as read when they open the thread.
    // =========================
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    timestamps: true,
    tableName: "Messages"
  }
);

module.exports = Message;