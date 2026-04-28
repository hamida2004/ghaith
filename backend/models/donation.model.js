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
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    donor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // =========================
    // DATA
    // =========================
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01 // prevent zero/negative
      }
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // =========================
    // STATUS
    // =========================
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "rejected"),
      allowNull: false,
      defaultValue: "pending"
    }
  },
  {
    timestamps: true,
    tableName: "Donations" // ⚠️ ensure matches DB
  }
);

module.exports = Donation;