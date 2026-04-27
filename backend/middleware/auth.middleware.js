const jwt = require("jsonwebtoken");

// =========================
// VERIFY TOKEN
// =========================
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, is_admin }

    next();

  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

// =========================
// ADMIN GUARD
// =========================
exports.isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ msg: "Admin access only" });
  }
  next();
};

// =========================
// OPTIONAL: ACTIVE USER CHECK
// =========================
exports.isActive = (req, res, next) => {
  if (req.user.status && req.user.status !== "active") {
    return res.status(403).json({ msg: "Account not active" });
  }
  next();
};