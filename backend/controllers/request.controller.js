const db = require("../models");

// CREATE REQUEST (USER)
exports.createRequest = async (req, res) => {
  try {
    const request = await db.Request.create({
      ...req.body,
      seeker_id: req.user.id
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET ALL (PUBLIC)
exports.getRequests = async (req, res) => {
  const requests = await db.Request.findAll({
    include: [db.User, db.Category]
  });

  res.json(requests);
};

// GET USER REQUESTS
exports.getMyRequests = async (req, res) => {
  const requests = await db.Request.findAll({
    where: { seeker_id: req.user.id }
  });

  res.json(requests);
};

// UPDATE STATUS (ADMIN)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  await db.Request.update({ status }, { where: { id } });

  res.json({ msg: "Request status updated" });
};