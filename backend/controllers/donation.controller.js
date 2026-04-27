const db = require("../models");
const { sequelize } = require("../models");

// =========================
// CREATE DONATION (PENDING)
// =========================
exports.createDonation = async (req, res) => {
  try {
    const { request_id, amount, notes } = req.body;

    if (!request_id || !amount) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const request = await db.Request.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    const donation = await db.Donation.create({
      request_id,
      donor_id: req.user.id,
      amount,
      notes,
      status: "pending"
    });

    res.status(201).json(donation);

  } catch (err) {
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
    const { status } = req.body; // confirmed | rejected

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const donation = await db.Donation.findByPk(id, {
      include: [db.Request],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!donation) {
      await t.rollback();
      return res.status(404).json({ msg: "Donation not found" });
    }

    // ✅ AUTHORIZATION: only seeker
    if (donation.Request.seeker_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ msg: "Not authorized" });
    }

    // prevent double processing
    if (donation.status !== "pending") {
      await t.rollback();
      return res.status(400).json({ msg: "Already processed" });
    }

    // update donation status
    donation.status = status;
    await donation.save({ transaction: t });

    // =========================
    // APPLY ONLY IF CONFIRMED
    // =========================
    if (status === "confirmed") {
      const request = donation.Request;

      const newAmount =
        parseFloat(request.collected_amount) +
        parseFloat(donation.amount);

      let donation_status = "not_satisfied";

      if (newAmount >= request.target_amount) {
        donation_status = "satisfied";
      } else if (newAmount > 0) {
        donation_status = "partially";
      }

      await request.update(
        {
          collected_amount: newAmount,
          donation_status
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.json({ msg: `Donation ${status}` });

  } catch (err) {
    await t.rollback();
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
      include: [db.Request],
      order: [["createdAt", "DESC"]]
    });

    res.json(donations);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// =========================
// GET PENDING DONATIONS (SEEKER)
// =========================
exports.getPendingDonations = async (req, res) => {
  try {
    const donations = await db.Donation.findAll({
      where: { status: "pending" },
      include: [
        {
          model: db.Request,
          where: { seeker_id: req.user.id }
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
    res.status(500).json(err.message);
  }
};