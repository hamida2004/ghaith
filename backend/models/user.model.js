const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    set(value) {
      this.setDataValue("email", value.toLowerCase());
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  type: {
    type: DataTypes.ENUM("person", "organization"),
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("pending", "active", "rejected"),
    defaultValue: "pending"
  },

  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  refresh_token: DataTypes.TEXT,

  reset_token: DataTypes.STRING,

  reset_token_expire: {
    type: DataTypes.DATE,
    validate: {
      isDate: true
    }
  }

}, {
  timestamps: true,

  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

module.exports = User;