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

    // =========================
    // VALIDATION
    // =========================
    if (
      !title ||
      !target_amount ||
      !type ||
      !address ||
      !occupation ||
      !urgency
    ) {
      return res.status(400).json({
        msg: "Missing required fields"
      });
    }

    if (urgency < 1 || urgency > 5) {
      return res.status(400).json({
        msg: "Invalid urgency"
      });
    }

    if (parseFloat(target_amount) <= 0) {
      return res.status(400).json({
        msg: "Invalid amount"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        msg: "Document required"
      });
    }

    const filePath =
      `/uploads/${req.file.filename}`;

    // =========================
    // CREATE
    // =========================
    const request =
      await db.Request.create({

        title,
        description,

        target_amount,

        type,

        category_id,

        seeker_id: req.user.id,

        phone:
          phone || req.user.phone,

        address,

        occupation,

        urgency,

        document: filePath
      });

    res.status(201).json(request);

  } catch (err) {

    console.error(
      "CREATE REQUEST ERROR:",
      err
    );

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// GET PUBLIC REQUESTS
// ONLY ACCEPTED
// =========================
exports.getRequests = async (req, res) => {
  try {

    const requests =
      await db.Request.findAll({

        where: {
          status: "accepted"
        },

        include: [

          {
            model: db.User,
            as: "Seeker",

            attributes: [
              "id",
              "name"
            ]
          },

          {
            model: db.Category,
            as: "Category"
          },

          {
            model: db.Donation,
            as: "Donations"
          }

        ],

        order: [["createdAt", "DESC"]]
      });

    res.json(requests);

  } catch (err) {

    console.error(
      "GET REQUESTS ERROR:",
      err
    );

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// GET ALL REQUESTS (ADMIN)
// =========================
exports.getAllRequests = async (req, res) => {
  try {

    const requests =
      await db.Request.findAll({

        include: [

          {
            model: db.User,
            as: "Seeker",

            attributes: [
              "id",
              "name",
              "email",
              "phone"
            ]
          },

          {
            model: db.Category,
            as: "Category"
          },

          {
            model: db.Donation,
            as: "Donations",

            include: [
              {
                model: db.User,
                as: "Donor",

                attributes: [
                  "id",
                  "name"
                ]
              }
            ]
          }

        ],

        order: [["createdAt", "DESC"]]
      });

    res.json(requests);

  } catch (err) {

    console.error(
      "GET ALL REQUESTS ERROR:",
      err
    );

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// GET MY REQUESTS (SEEKER)
// =========================
exports.getMyRequests = async (req, res) => {
  try {

    const requests =
      await db.Request.findAll({

        where: {
          seeker_id: req.user.id
        },

        include: [

          {
            model: db.Category,
            as: "Category"
          },

          {
            model: db.Donation,
            as: "Donations",

            include: [
              {
                model: db.User,
                as: "Donor",

                attributes: [
                  "id",
                  "name",
                  "email"
                ]
              }
            ]
          }

        ],

        order: [["createdAt", "DESC"]]
      });

    res.json(requests);

  } catch (err) {

    console.error(
      "GET MY REQUESTS ERROR:",
      err
    );

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// UPDATE REQUEST STATUS
// =========================
exports.updateStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    if (
      ![
        "pending",
        "accepted",
        "refused"
      ].includes(status)
    ) {
      return res.status(400).json({
        msg: "Invalid status"
      });
    }

    await db.Request.update(
      { status },
      {
        where: { id }
      }
    );

    res.json({
      msg: "Request status updated"
    });

  } catch (err) {

    console.error(
      "UPDATE REQUEST STATUS ERROR:",
      err
    );

    res.status(500).json({
      msg: err.message
    });
  }
};