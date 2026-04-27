const db = require("../models");
const { Sequelize } = require("sequelize");

// STATS
exports.getStats = async (req, res) => {
  const users = await db.User.count();
  const requests = await db.Request.count();

  const perCategory = await db.Request.findAll({
    attributes: [
      "category_id",
      [Sequelize.fn("COUNT", "*"), "count"]
    ],
    group: ["category_id"]
  });

  res.json({
    users,
    requests,
    perCategory
  });
};