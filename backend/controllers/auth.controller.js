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
    const { name, email, password, type } = req.body;

    const existing = await db.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const user = await db.User.create({
      name,
      email,
      password, // hashed via model hook
      type,
      status: "pending"
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

// =========================
// REQUEST RESET
// =========================
exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔥 Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.reset_token = code;
    user.reset_token_expire = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    await sendResetEmail(email, code);

    res.json({ msg: "Reset code sent" });

  } catch (err) {
    res.status(500).json({ msg: "Error sending email" });
  }
};

// =========================
// RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const user = await db.User.findOne({ where: { email } });

    if (!user || user.reset_token !== code) {
      return res.status(400).json({ msg: "Invalid code" });
    }

    if (user.reset_token_expire < new Date()) {
      return res.status(400).json({ msg: "Code expired" });
    }

    user.password = password; // hashed via hook
    user.reset_token = null;
    user.reset_token_expire = null;

    await user.save();

    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
// =========================
// GET CURRENT USER
// =========================
exports.me = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "refresh_token"] }
    });

    res.json(user);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};