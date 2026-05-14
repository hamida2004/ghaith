const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Donation = sequelize.define(
  "Donation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // =========================
    // RELATIONS
    // =========================

    // NULL for free donations (no target request yet)
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: true       // ← changed: was false
    },

    donor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // For child dispatches created by admin:
    // points to the parent free donation's id
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,      // null for all root donations
      defaultValue: null
    },

    // =========================
    // TYPE
    // =========================
    // "targeted" = donor chose a specific request
    // "free"     = donor gave without a target; admin dispatches later
    type: {
      type: DataTypes.ENUM("targeted", "free"),
      allowNull: false,
      defaultValue: "targeted"
    },

    // =========================
    // DATA
    // =========================
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 }
    },

    // For child dispatches: the portion the admin actually sends
    // (can be less than the parent free donation's amount)
    allocated_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // =========================
    // STATUS
    // =========================
    // Full lifecycle:
    //
    // TARGETED PATH (original):
    //   pending_admin → pending_seeker → confirmed | rejected
    //
    // FREE PATH (new):
    //   pending_admin → pending_assignment   (admin approved; awaiting dispatch)
    //                 → rejected             (admin rejected)
    //
    // CHILD DISPATCH (created by admin from a free donation):
    //   pending_seeker → confirmed | rejected
    //
    status: {
      type: DataTypes.ENUM(
        "pending_admin",       // waiting for admin first look
        "pending_assignment",  // free donation approved; admin hasn't dispatched yet
        "pending_seeker",      // seeker needs to confirm receipt
        "confirmed",           // seeker confirmed; amount credited to request
        "rejected"             // rejected at any stage
      ),
      defaultValue: "pending_admin"
    }
  },
  {
    timestamps: true,
    tableName: "Donations"
  }
);

module.exports = Donation;