const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Request = sequelize.define("Request", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  target_amount: {
    type: DataTypes.DECIMAL(10,2)
  },
  collected_amount: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0
  },
  donation_status: {
    type: DataTypes.ENUM("not_satisfied", "partially", "satisfied"),
    defaultValue: "not_satisfied"
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "refused"),
    defaultValue: "pending"
  },
  type: {
    type: DataTypes.ENUM("money", "things"),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Request;