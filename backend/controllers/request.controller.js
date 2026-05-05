const db = require("../models");

// =========================
// CREATE REQUEST (USER)
// =========================


exports.createRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      target_amount,
      type,
      category_id,
      phone,
      address,
      occupation,
      urgency
    } = req.body;

     if (!title || !target_amount || !type || !address || !occupation || !urgency ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (urgency < 1 || urgency > 5) {
  return res.status(400).json({ msg: "Invalid urgency" });
}

if (parseFloat(target_amount) <= 0) {
  return res.status(400).json({ msg: "Invalid amount" });
}
    if (!req.file) {
      return res.status(400).json({ msg: "Document required" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const request = await db.Request.create({
      title,
      description,
      target_amount,
      type,
      category_id,
      seeker_id: req.user.id,
      phone: phone || req.user.phone,
      address,
      occupation,
      urgency,
      document: filePath
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
      where: { status: "accepted" }, // 🔥 CRITICAL
      include: [
        { model: db.User, attributes: ["id", "name"] },
        db.Category
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(requests);

  } catch (err) {
    res.status(500).json(err.message);
  }
};
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await db.Request.findAll({
      include: [
        { model: db.User, attributes: ["id", "name"] },
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