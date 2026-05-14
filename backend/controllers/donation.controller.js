const db = require("../models");
const { sequelize } = require("../models");
const { Op } = require("sequelize");

// =========================
// GET ALL DONATIONS (ADMIN)
// =========================
exports.getAllDonations = async (req, res) => {
  try {

    const donations =
      await db.Donation.findAll({

        // only root donations
        where: {
          parent_id: null
        },

        include: [

          // =========================
          // DONOR
          // =========================
          {
            model: db.User,
            as: "Donor",

            attributes: [
              "id",
              "name",
              "email",
              "phone"
            ]
          },

          // =========================
          // REQUEST
          // =========================
          {
            model: db.Request,
            as: "Request",

            attributes: [
              "id",
              "title",
              "status",
              "donation_status",
              "target_amount",
              "collected_amount"
            ],

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
                as: "Category",

                attributes: [
                  "id",
                  "name"
                ]
              }
            ]
          },

          // =========================
          // CHILD DISPATCHES
          // =========================
          {
            model: db.Donation,
            as: "Dispatches",

            include: [

              {
                model: db.Request,
                as: "Request",

                attributes: [
                  "id",
                  "title",
                  "status",
                  "donation_status"
                ],

                include: [
                  {
                    model: db.User,
                    as: "Seeker",

                    attributes: [
                      "id",
                      "name"
                    ]
                  }
                ]
              },

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

    res.json(donations);

  } catch (err) {

    console.error(
      "GET ALL DONATIONS ERROR:",
      err
    );

    res.status(500).json({
      msg: err.message
    });
  }
};


// =========================
// ADMIN: GET UNASSIGNED FREE DONATIONS
// Free donations that were approved but not yet fully dispatched
// =========================
exports.getUnassignedDonations = async (req, res) => {
  try {
    const donations = await db.Donation.findAll({
      where: {
        type: "free",
        status: "pending_assignment",
        parent_id: null
      },
      include: [
        { model: db.User, as: "Donor", attributes: ["id", "name"] },
        {
          model: db.Donation,
          as: "Dispatches",
          include: [
            { model: db.Request, attributes: ["id", "title"] }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// CREATE DONATION (DONATOR)
// With request_id    → targeted donation (existing flow)
// Without request_id → free donation (new flow)
// =========================
exports.createDonation = async (req, res) => {
  try {
    const { request_id, amount, notes } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    // ── FREE DONATION (no request) ──────────────────────────────
    if (!request_id) {
      const donation = await db.Donation.create({
        request_id: null,
        donor_id: req.user.id,
        amount: parsedAmount,
        notes,
        type: "free",
        status: "pending_admin"
      });

      return res.status(201).json(donation);
    }

    // ── TARGETED DONATION (existing flow) ───────────────────────
    const request = await db.Request.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }
    if (request.status !== "accepted") {
      return res.status(400).json({ msg: "Cannot donate to non-approved request" });
    }
    if (request.donation_status === "satisfied") {
      return res.status(400).json({ msg: "Request already satisfied" });
    }

    const donation = await db.Donation.create({
      request_id,
      donor_id: req.user.id,
      amount: parsedAmount,
      notes,
      type: "targeted",
      status: "pending_admin"
    });

    return res.status(201).json(donation);
  } catch (err) {
    console.error("CREATE DONATION ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// ADMIN: APPROVE / REJECT
// Targeted → pending_seeker or rejected
// Free     → pending_assignment or rejected
// =========================
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

    if (!approve) {
      donation.status = "rejected";
      await donation.save();
      return res.json({ msg: "Donation rejected by admin" });
    }

    // Approve: route depends on type
    if (donation.type === "free") {
      donation.status = "pending_assignment";
    } else {
      // targeted: go straight to seeker
      donation.status = "pending_seeker";
    }

    await donation.save();

    res.json({
      msg:
        donation.type === "free"
          ? "Free donation approved — awaiting admin dispatch"
          : "Donation sent to seeker for validation"
    });
  } catch (err) {
    console.error("ADMIN VALIDATION ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// ADMIN: DISPATCH FREE DONATION
// Picks a seeker request and creates a child donation
// Body: { request_id, allocated_amount, notes? }
// =========================
exports.dispatchDonation = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;                          // parent free donation id
    const { request_id, allocated_amount, notes } = req.body;

    if (!request_id || !allocated_amount) {
      await t.rollback();
      return res.status(400).json({ msg: "request_id and allocated_amount are required" });
    }

    const parsedAllocated = parseFloat(allocated_amount);
    if (isNaN(parsedAllocated) || parsedAllocated <= 0) {
      await t.rollback();
      return res.status(400).json({ msg: "Invalid allocated_amount" });
    }

    // ── Load & lock the parent free donation ───────────────────
    const parent = await db.Donation.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!parent) {
      await t.rollback();
      return res.status(404).json({ msg: "Parent donation not found" });
    }
    if (parent.type !== "free") {
      await t.rollback();
      return res.status(400).json({ msg: "Only free donations can be dispatched" });
    }
    if (parent.status !== "pending_assignment") {
      await t.rollback();
      return res.status(400).json({ msg: "Donation is not in pending_assignment status" });
    }

    // ── Check the parent has enough remaining balance ──────────
    // Sum all non-rejected child dispatches already made
    const usedResult = await db.Donation.sum("allocated_amount", {
      where: {
        parent_id: parent.id,
        status: { [Op.not]: "rejected" }
      },
      transaction: t
    });
    const usedAmount = parseFloat(usedResult || 0);
    const parentAmount = parseFloat(parent.amount);
    const remaining = parentAmount - usedAmount;

    if (parsedAllocated > remaining) {
      await t.rollback();
      return res.status(400).json({
        msg: `Cannot allocate ${parsedAllocated}. Only ${remaining.toFixed(2)} remaining from the original donation.`
      });
    }

    // ── Validate the target request ────────────────────────────
    const request = await db.Request.findByPk(request_id, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!request) {
      await t.rollback();
      return res.status(404).json({ msg: "Request not found" });
    }
    if (request.status !== "accepted") {
      await t.rollback();
      return res.status(400).json({ msg: "Request is not accepted" });
    }
    if (request.donation_status === "satisfied") {
      await t.rollback();
      return res.status(400).json({ msg: "Request already satisfied" });
    }

    // ── Create the child dispatch donation ─────────────────────
    // It goes straight to pending_seeker (admin already validated the money)
    const child = await db.Donation.create(
      {
        parent_id: parent.id,
        request_id,
        donor_id: parent.donor_id,     // credit still belongs to original donor
        amount: parsedAllocated,
        allocated_amount: parsedAllocated,
        notes: notes || null,
        type: "targeted",
        status: "pending_seeker"       // skip pending_admin; admin just approved it
      },
      { transaction: t }
    );

    // ── Mark parent as fully dispatched if nothing remains ─────
    const newUsed = usedAmount + parsedAllocated;
    if (newUsed >= parentAmount) {
      parent.status = "confirmed";     // all money dispatched
      await parent.save({ transaction: t });
    }

    await t.commit();

    res.status(201).json({
      msg: "Dispatch created — seeker will now validate",
      dispatch: child,
      remaining: (parentAmount - newUsed).toFixed(2)
    });
  } catch (err) {
    await t.rollback();
    console.error("DISPATCH DONATION ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// SEEKER: CONFIRM / REJECT RECEIPT
// (unchanged logic — works for both targeted and child dispatches)
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

    const donation = await db.Donation.findByPk(id, {
      include: [{ model: db.Request, required: true }],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!donation) {
      await t.rollback();
      return res.status(404).json({ msg: "Donation not found" });
    }

    const request = donation.Request;

    if (request.seeker_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (donation.status !== "pending_seeker") {
      await t.rollback();
      return res.status(400).json({ msg: "Donation not ready for seeker validation" });
    }

    const lockedRequest = await db.Request.findByPk(request.id, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    donation.status = status;
    await donation.save({ transaction: t });

    if (status === "confirmed") {
      // Use allocated_amount for child dispatches, amount otherwise
      const effectiveAmount = parseFloat(
        donation.allocated_amount ?? donation.amount
      );
      const collected = parseFloat(lockedRequest.collected_amount || 0);
      const newAmount = collected + effectiveAmount;

      let donation_status = "not_satisfied";
      if (newAmount >= lockedRequest.target_amount) {
        donation_status = "satisfied";
      } else if (newAmount > 0) {
        donation_status = "partially";
      }

      await lockedRequest.update(
        { collected_amount: newAmount, donation_status },
        { transaction: t }
      );

      // If this is a child dispatch and the parent is still pending_assignment,
      // keep it open (more dispatches may follow). Nothing extra needed here.
    }

    await t.commit();

    res.json({
      msg: `Donation ${status}`,
      donation_id: donation.id,
      new_status: donation.status
    });
  } catch (err) {
    await t.rollback();
    console.error("UPDATE DONATION STATUS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// DONATOR: GET MY DONATIONS
// Returns root donations with child dispatches nested inside
// =========================
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await db.Donation.findAll({
      where: {
        donor_id: req.user.id,
        parent_id: null               // only root donations
      },
      include: [
        { model: db.Request, attributes: ["id", "title"] },
        {
          model: db.Donation,
          as: "Dispatches",           // child dispatches
          include: [
            { model: db.Request, attributes: ["id", "title"] }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(donations);
  } catch (err) {
    console.error("GET MY DONATIONS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// SEEKER: GET PENDING DONATIONS
// (unchanged — shows pending_seeker donations on their requests)
// =========================
exports.getPendingDonations = async (req, res) => {
  try {
    const donations = await db.Donation.findAll({
      where: { status: "pending_seeker" },
      include: [
        {
          model: db.Request,
          where: { seeker_id: req.user.id },
          required: true
        },
        {
          model: db.User,
          as: "Donor",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(donations);
  } catch (err) {
    console.error("GET PENDING DONATIONS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};