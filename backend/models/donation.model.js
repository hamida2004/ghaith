const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Donation = sequelize.define("Donation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2), // ✅ FIXED (was FLOAT)
    allowNull: false
  },
  notes: DataTypes.TEXT
}, {
  timestamps: true
});

module.exports = Donation;