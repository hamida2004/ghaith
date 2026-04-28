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

    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const request = await db.Request.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    const donation = await db.Donation.create({
      request_id,
      donor_id: req.user.id,
      amount: parsedAmount,
      notes,
      status: "pending"
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

    if (!["confirmed", "rejected"].includes(status)) {
      await t.rollback();
      return res.status(400).json({ msg: "Invalid status" });
    }

    // ✅ FIX: force INNER JOIN (required: true)
    const donation = await db.Donation.findByPk(id, {
      include: [
        {
          model: db.Request,
          required: true // 🔥 FIX FOR OUTER JOIN ERROR
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

    // ✅ AUTHORIZATION
    if (request.seeker_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ msg: "Not authorized" });
    }

    // ✅ prevent double processing
    if (donation.status !== "pending") {
      await t.rollback();
      return res.status(400).json({ msg: "Already processed" });
    }

    // =========================
    // LOCK REQUEST ROW (IMPORTANT)
    // =========================
    const lockedRequest = await db.Request.findByPk(request.id, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    // =========================
    // UPDATE DONATION
    // =========================
    donation.status = status;
    await donation.save({ transaction: t });

    // =========================
    // APPLY ONLY IF CONFIRMED
    // =========================
    if (status === "confirmed") {
      const newAmount =
        parseFloat(lockedRequest.collected_amount) +
        parseFloat(donation.amount);

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

    res.json({ msg: `Donation ${status}` });

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
      where: { status: "pending" },
      include: [
        {
          model: db.Request,
          where: { seeker_id: req.user.id },
          required: true // ✅ avoid outer join issues
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