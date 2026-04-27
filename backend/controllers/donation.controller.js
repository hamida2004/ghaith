const db = require("../models");

// CREATE DONATION
exports.createDonation = async (req, res) => {
  try {
    const { request_id, amount } = req.body;

    const donation = await db.Donation.create({
      request_id,
      donor_id: req.user.id,
      amount
    });

    // UPDATE REQUEST COLLECTED AMOUNT
    const request = await db.Request.findByPk(request_id);

    const newAmount =
      parseFloat(request.collected_amount) + parseFloat(amount);

    let donation_status = "not_satisfied";

    if (newAmount >= request.target_amount) {
      donation_status = "satisfied";
    } else if (newAmount > 0) {
      donation_status = "partially";
    }

    await request.update({
      collected_amount: newAmount,
      donation_status
    });

    res.status(201).json(donation);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET MY DONATIONS
exports.getMyDonations = async (req, res) => {
  const donations = await db.Donation.findAll({
    where: { donor_id: req.user.id },
    include: [db.Request]
  });

  res.json(donations);
};