const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendResetEmail } = require("../utils/mailer");

// =========================
// GENERATE TOKEN
// =========================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      is_admin: user.is_admin
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// =========================
// REGISTER
// =========================
exports.register = async (req, res) => {
  try {
    const { name, email, password, type, phone } = req.body;

    // =========================
    // BASIC VALIDATION
    // =========================
    if (!name || !email || !password || !type) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (!["person", "organization"].includes(type)) {
      return res.status(400).json({ msg: "Invalid user type" });
    }

    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      return res.status(400).json({ msg: "Invalid phone number" });
    }

    // =========================
    // CHECK EMAIL
    // =========================
    const existing = await db.User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // =========================
    // CREATE USER
    // =========================
    await db.User.create({
      name,
      email,
      password, // hashed via hook
      type,
      phone: phone || null,
      status: "pending",
    });

    res.status(201).json({ msg: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
// =========================
// LOGIN
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }



    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin
      }
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =========================
// LOGOUT (stateless)
// =========================
exports.logout = async (req, res) => {
  try {
    res.json({ msg: "Logout successful (delete token client-side)" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
const db = require("../models");
const bcrypt = require("bcrypt");

// =========================
// REQUEST RESET
// =========================
exports.requestReset = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // 🔥 Normalize email
    email = email.trim().toLowerCase();

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // =========================
    // OPTIONAL RATE LIMIT (recommended)
    // =========================
    if (
      user.reset_token &&
      user.reset_token_expire &&
      user.reset_token_expire > new Date()
    ) {
      return res.status(400).json({
        msg: "A reset code was already sent. Please wait before requesting again."
      });
    }

    // =========================
    // GENERATE 6-DIGIT CODE
    // =========================
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.reset_token = code;
    user.reset_token_expire = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await user.save();

    // =========================
    // SEND EMAIL (make sure implemented)
    // =========================
    await sendResetEmail(email, code);

    res.json({ msg: "Reset code sent" });

  } catch (err) {
    console.error("REQUEST RESET ERROR:", err);
    res.status(500).json({ msg: "Error sending reset email" });
  }
};


// =========================
// RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
  try {
    let { email, code, password } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!email || !code || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ msg: "Invalid code format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password too short" });
    }

    // 🔥 Normalize
    email = email.trim().toLowerCase();
    code = code.trim();

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ msg: "Invalid email or code" });
    }

    // =========================
    // CHECK CODE
    // =========================
    if (!user.reset_token || user.reset_token !== code) {
      return res.status(400).json({ msg: "Invalid code" });
    }

    // =========================
    // CHECK EXPIRATION
    // =========================
    if (!user.reset_token_expire || user.reset_token_expire < new Date()) {
      return res.status(400).json({ msg: "Code expired" });
    }

    // =========================
    // UPDATE PASSWORD
    // =========================
    user.password = password; // hashed via model hook

    // clear reset fields
    user.reset_token = null;
    user.reset_token_expire = null;

    await user.save();

    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ msg: "Reset failed" });
  }
};


// =========================
// GET CURRENT USER
// =========================
exports.me = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password", "refresh_token", "reset_token"]
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};