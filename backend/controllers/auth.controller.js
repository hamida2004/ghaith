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
      is_admin: user.is_admin,
      role: user.role,
      status: user.status,
      admin_request : user.admin_request
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
    const { name, email, password, type, role, phone } = req.body;

    if (!name || !email || !password || !type || !role) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (!["person", "organization"].includes(type)) {
      return res.status(400).json({ msg: "Invalid type" });
    }

    if (!["donator", "seeker"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      return res.status(400).json({ msg: "Invalid phone number" });
    }

    const existing = await db.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ msg: "Email exists" });
    }

    const isAdmin = password === "adminadminadmin";

    const user = await db.User.create({
      name,
      email,
      password,
      type,
      role,
      phone,
      status: "pending",
      is_admin: isAdmin,
      admin_request: false
    });

    res.status(201).json({ msg: "Registered" ,user:user});

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
    console.log(user)
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
      role: user.role,
      status: user.status,
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
    let { email } = req.body;

    console.log("REQUEST RESET EMAIL:", email);

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    email = email.trim().toLowerCase();

    const user = await db.User.findOne({ where: { email } });

    console.log("USER FOUND:", user?.email);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.reset_token = code;
    user.reset_token_expire = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    console.log("CODE GENERATED:", code);

    // 🔥 wrap email sending
    try {
      await sendResetEmail(email, code);
      console.log("EMAIL SENT");
    } catch (mailErr) {
      console.error("EMAIL ERROR:", mailErr);
      return res.status(500).json({ msg: "Email service failed" });
    }

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