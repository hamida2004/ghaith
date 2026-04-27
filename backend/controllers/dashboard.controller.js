const db = require("../models");
const sequelize = require("../config/db");
const { Sequelize, QueryTypes } = require("sequelize");

// =====================
// DASHBOARD CONTROLLER
// =====================
exports.getStats = async (req, res) => {
  try {
    // =====================
    // TOTALS
    // =====================
    const totalUsers = await db.User.count();
    const totalRequests = await db.Request.count();

    // =====================
    // REQUESTS PER CATEGORY
    // =====================
    const perCategoryRaw = await db.Request.findAll({
      attributes: [
        "category_id",
        [Sequelize.fn("COUNT", "*"), "count"]
      ],
      group: ["category_id"]
    });

    // Map category_id → category name
    const categories = await db.Category.findAll();
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.id] = c.name;
    });

    const requestsPerCategory = {};
    perCategoryRaw.forEach(r => {
      const categoryId = r.category_id;
      const name = categoryMap[categoryId] || `Category ${categoryId}`;
      requestsPerCategory[name] = parseInt(r.dataValues.count);
    });

    // =====================
    // REQUESTS PER MONTH (POSTGRESQL)
    // =====================
    const perMonthRaw = await sequelize.query(`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") AS month,
        COUNT(*) AS count
      FROM "Requests"
      GROUP BY month
      ORDER BY month ASC
    `, {
      type: QueryTypes.SELECT
    });

    const requestsPerMonth = Array(12).fill(0);

    perMonthRaw.forEach(r => {
      const m = parseInt(r.month) - 1;
      requestsPerMonth[m] = parseInt(r.count);
    });

    // =====================
    // DONATION STATUS
    // =====================
    const donationStatusRaw = await db.Request.findAll({
      attributes: [
        "donation_status",
        [Sequelize.fn("COUNT", "*"), "count"]
      ],
      group: ["donation_status"]
    });

    const donationStatus = {
      satisfied: 0,
      partially: 0,
      not_satisfied: 0
    };

    donationStatusRaw.forEach(r => {
      donationStatus[r.donation_status] = parseInt(r.dataValues.count);
    });

    // =====================
    // FINAL RESPONSE
    // =====================
    res.json({
      totalUsers,
      totalRequests,
      requestsPerMonth,
      donationStatus,
      requestsPerCategory
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ msg: err.message });
  }
};