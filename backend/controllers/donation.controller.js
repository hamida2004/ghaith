const db = require("../models");
const { sequelize } = require("../models");

// =========================
// CREATE DONATION (PENDING)
// =========================
// ADMIN GET ALL DONATIONS
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await db.Donation.findAll({
      include: [
        { model: db.User, attributes: ["id", "name"] },
        { model: db.Request, attributes: ["id", "title"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(donations);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.createDonation = async (req, res) => {
  try {
    const { request_id, amount, notes } = req.body;

    if (!request_id || !amount) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const request = await db.Request.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }
    if (request.status !== "accepted") {
  return res.status(400).json({
    msg: "Cannot donate to non-approved request"
  });
}

if (request.donation_status === "satisfied") {
  return res.status(400).json({
    msg: "Request already satisfied"
  });
}
    const donation = await db.Donation.create({
      request_id,
      donor_id: req.user.id,
      amount: parsedAmount,
      notes,
      status: "pending_admin"
    });

    res.status(201).json(donation);

  } catch (err) {
    console.error("CREATE DONATION ERROR:", err);
    res.status(500).json(err.message);
  }
};

// =========================
// CONFIRM / REJECT DONATION (SEEKER)
// =========================
exports.updateDonationStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!["confirmed", "rejected"].includes(status)) {
      await t.rollback();
      return res.status(400).json({ msg: "Invalid status" });
    }

    // =========================
    // FETCH + LOCK DONATION
    // =========================
    const donation = await db.Donation.findByPk(id, {
      include: [
        {
          model: db.Request,
          required: true
        }
      ],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!donation) {
      await t.rollback();
      return res.status(404).json({ msg: "Donation not found" });
    }

    const request = donation.Request;

    // =========================
    // AUTHORIZATION
    // =========================
    if (request.seeker_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ msg: "Not authorized" });
    }

    // =========================
    // WORKFLOW CHECK (NEW)
    // =========================
    if (donation.status !== "pending_seeker") {
      await t.rollback();
      return res.status(400).json({
        msg: "Donation not ready for seeker validation"
      });
    }

    // =========================
    // LOCK REQUEST ROW
    // =========================
    const lockedRequest = await db.Request.findByPk(request.id, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    // =========================
    // UPDATE DONATION STATUS
    // =========================
    donation.status = status;
    await donation.save({ transaction: t });

    // =========================
    // APPLY ONLY IF CONFIRMED
    // =========================
    if (status === "confirmed") {
      const amount = parseFloat(donation.amount);
      const collected = parseFloat(lockedRequest.collected_amount);
      const newAmount = collected + amount;
      let donation_status = "not_satisfied";

      if (newAmount >= lockedRequest.target_amount) {
        donation_status = "satisfied";
      } else if (newAmount > 0) {
        donation_status = "partially";
      }

      await lockedRequest.update(
        {
          collected_amount: newAmount,
          donation_status
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.json({
      msg: `Donation ${status}`,
      donation_id: donation.id,
      new_status: donation.status
    });

  } catch (err) {
    await t.rollback();
    console.error("UPDATE DONATION ERROR:", err);
    res.status(500).json(err.message);
  }
};
// =========================
// GET MY DONATIONS (DONOR)
// =========================
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await db.Donation.findAll({
      where: { donor_id: req.user.id },
      include: [
        {
          model: db.Request
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(donations);

  } catch (err) {
    console.error("GET MY DONATIONS ERROR:", err);
    res.status(500).json(err.message);
  }
};

// =========================
// GET PENDING DONATIONS (SEEKER)
// =========================
exports.getPendingDonations = async (req, res) => {
  try {
    const donations = await db.Donation.findAll({
      where: { status: "pending_seeker" }, // ✅ FIX
      include: [
        {
          model: db.Request,
          where: { seeker_id: req.user.id },
          required: true
        },
        {
          model: db.User,
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(donations);

  } catch (err) {
    console.error("GET PENDING DONATIONS ERROR:", err);
    res.status(500).json(err.message);
  }
};

exports.adminValidateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    const donation = await db.Donation.findByPk(id);

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }

    if (donation.status !== "pending_admin") {
      return res.status(400).json({ msg: "Already processed" });
    }

    donation.status = approve
      ? "pending_seeker"
      : "rejected";

    await donation.save();

    res.json({
      msg: approve
        ? "Donation sent to seeker validation"
        : "Donation rejected by admin"
    });

  } catch (err) {
    console.error("ADMIN VALIDATION ERROR:", err);
    res.status(500).json(err.message);
  }
};