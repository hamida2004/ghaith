const db = require("../models");

// =========================
// CREATE REQUEST (USER)
// =========================
exports.createRequest = async (req, res) => {
  try {
    const { title, description, target_amount, type, category_id } = req.body;

    if (!title || !target_amount || !type) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const request = await db.Request.create({
      title,
      description,
      target_amount,
      type,
      category_id,
      seeker_id: req.user.id
    });

    res.status(201).json(request);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// =========================
// GET ALL REQUESTS (PUBLIC)
// =========================
exports.getRequests = async (req, res) => {
  try {
    const requests = await db.Request.findAll({
      include: [
        {
          model: db.User,
          attributes: ["id", "name"]
        },
        db.Category
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(requests);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// =========================
// GET MY REQUESTS (SEEKER)
// =========================
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await db.Request.findAll({
      where: { seeker_id: req.user.id },
      order: [["createdAt", "DESC"]]
    });

    res.json(requests);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// =========================
// UPDATE REQUEST STATUS (ADMIN)
// =========================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "refused"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    await db.Request.update(
      { status },
      { where: { id } }
    );

    res.json({ msg: "Request status updated" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};