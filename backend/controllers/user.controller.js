const db = require("../models");

// =========================
// GET ALL USERS (ADMIN)
// =========================
exports.getUsers = async (req, res) => {
  try {

    const users = await db.User.findAll({
      attributes: {
        exclude: ["password"]
      },

      include: [
        {
          model: db.Document,
          as: "Documents"
        },

        {
          model: db.Request,
          as: "Requests"
        },

        {
          model: db.Donation,
          as: "Donations"
        }
      ]
    });

    res.json(users);

  } catch (err) {

    console.error("GET USERS ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// UPDATE USER STATUS
// =========================
exports.updateStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    await db.User.update(
      { status },
      {
        where: { id }
      }
    );

    res.json({
      msg: "User status updated"
    });

  } catch (err) {

    console.error("UPDATE STATUS ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// TOGGLE ADMIN
// =========================
exports.toggleAdmin = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    user.is_admin = !user.is_admin;

    await user.save();

    res.json({
      msg: "Admin role updated"
    });

  } catch (err) {

    console.error("TOGGLE ADMIN ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// GET MY PROFILE
// =========================
exports.getMe = async (req, res) => {
  try {

    const user = await db.User.findByPk(req.user.id, {

      attributes: {
        exclude: ["password"]
      },

      include: [
        {
          model: db.Document,
          as: "Documents"
        },

        {
          model: db.Request,
          as: "Requests"
        },

        {
          model: db.Donation,
          as: "Donations"
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    res.json(user);

  } catch (err) {

    console.error("GET ME ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// UPDATE PROFILE
// =========================
exports.updateMe = async (req, res) => {
  try {

    const { name, email, phone } = req.body;

    await db.User.update(
      {
        name,
        email,
        phone
      },
      {
        where: {
          id: req.user.id
        }
      }
    );

    res.json({
      msg: "Profile updated"
    });

  } catch (err) {

    console.error("UPDATE ME ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// UPLOAD DOCUMENT
// =========================
exports.uploadDocument = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        msg: "No file uploaded"
      });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const { type } = req.body;

    // =========================
    // CHECK IF EXISTS
    // =========================
    const existingDoc = await db.Document.findOne({
      where: {
        user_id: req.user.id,
        type
      }
    });

    // =========================
    // UPDATE EXISTING
    // =========================
    if (existingDoc) {

      await db.Document.update(
        {
          file_path: filePath,
          status: "pending",
          rejection_reason: null
        },
        {
          where: {
            user_id: req.user.id,
            type
          }
        }
      );

      return res.json({
        msg: "Document re-uploaded, waiting for approval"
      });
    }

    // =========================
    // CREATE NEW
    // =========================
    const doc = await db.Document.create({
      user_id: req.user.id,
      file_path: filePath,
      type
    });

    res.json(doc);

  } catch (err) {

    console.error("UPLOAD DOCUMENT ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// UPDATE DOCUMENT STATUS
// =========================
exports.updateDocumentStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status, reason } = req.body;

    const doc = await db.Document.findByPk(id);

    if (!doc) {
      return res.status(404).json({
        msg: "Document not found"
      });
    }

    doc.status = status;

    doc.rejection_reason =
      status === "rejected"
        ? reason
        : null;

    await doc.save();

    // =========================
    // UPDATE USER STATUS
    // =========================
    if (status === "approved") {

      await db.User.update(
        { status: "active" },
        {
          where: {
            id: doc.user_id
          }
        }
      );
    }

    if (status === "rejected") {

      await db.User.update(
        { status: "rejected" },
        {
          where: {
            id: doc.user_id
          }
        }
      );
    }

    res.json({
      msg: "Document updated"
    });

  } catch (err) {

    console.error("UPDATE DOCUMENT ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// REQUEST ADMIN ROLE
// =========================
exports.requestAdmin = async (req, res) => {
  try {

    if (req.user.is_admin) {
      return res.status(400).json({
        msg: "Already admin"
      });
    }

    await db.User.update(
      {
        admin_request: true
      },
      {
        where: {
          id: req.user.id
        }
      }
    );

    res.json({
      msg: "Admin request sent"
    });

  } catch (err) {

    console.error("REQUEST ADMIN ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// HANDLE ADMIN REQUEST
// =========================
exports.handleAdminRequest = async (req, res) => {
  try {

    const { id } = req.params;
    const { approve } = req.body;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        msg: "Not found"
      });
    }

    if (!user.admin_request) {
      return res.status(400).json({
        msg: "No pending request"
      });
    }

    user.admin_request = false;

    if (approve) {
      user.is_admin = true;
    }

    await user.save();

    res.json({
      msg: "Admin request handled"
    });

  } catch (err) {

    console.error("HANDLE ADMIN REQUEST ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};

// =========================
// GET ADMIN REQUESTS
// =========================
exports.getAdminRequests = async (req, res) => {
  try {

    const users = await db.User.findAll({
      where: {
        admin_request: true
      },

      attributes: [
        "id",
        "name",
        "email",
        "role",
        "type"
      ]
    });

    res.json(users);

  } catch (err) {

    console.error("GET ADMIN REQUESTS ERROR:", err);

    res.status(500).json({
      msg: err.message
    });
  }
};