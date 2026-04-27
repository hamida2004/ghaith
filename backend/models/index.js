const User = require("./user.model");
const Request = require("./request.model");
const Donation = require("./donation.model");
const Category = require("./category.model");
const Document = require("./document.model");

// =====================
// RELATIONS
// =====================

// USER → REQUEST (seeker)
User.hasMany(Request, { foreignKey: "seeker_id" });
Request.belongsTo(User, { foreignKey: "seeker_id" });

// USER → DONATION (donor)
User.hasMany(Donation, { foreignKey: "donor_id" });
Donation.belongsTo(User, { foreignKey: "donor_id" });

// REQUEST → DONATION
Request.hasMany(Donation, { foreignKey: "request_id" });
Donation.belongsTo(Request, { foreignKey: "request_id" });

// CATEGORY → REQUEST
Category.hasMany(Request, { foreignKey: "category_id" });
Request.belongsTo(Category, { foreignKey: "category_id" });

// USER → DOCUMENT
User.hasMany(Document, { foreignKey: "user_id" });
Document.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  User,
  Request,
  Donation,
  Category,
  Document
};