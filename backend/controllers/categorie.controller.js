const db = require("../models");

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const category = await db.Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET ALL
exports.getCategories = async (req, res) => {
  const categories = await db.Category.findAll();
  res.json(categories);
};

// UPDATE
exports.updateCategory = async (req, res) => {
  const { id } = req.params;

  await db.Category.update(req.body, { where: { id } });

  res.json({ msg: "Category updated" });
};

// DELETE
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  await db.Category.destroy({ where: { id } });

  res.json({ msg: "Category deleted" });
};