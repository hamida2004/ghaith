require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

// IMPORT DB MODELS
const db = require("./models");

const app = express();

// =====================
// MIDDLEWARES
// =====================
app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  require("express").static("uploads")
);

// =====================
// ROUTES
// =====================
app.use("/auth", require("./routes/auth.routes"));
app.use("/requests", require("./routes/request.routes"));
app.use("/donations", require("./routes/donation.routes"));
app.use("/users", require("./routes/user.routes"));
app.use("/categories", require("./routes/categorie.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));
app.use("/messages", require("./routes/message.routes"));

// =====================
// DEV ROUTE: CLEAR DB
// =====================
app.get("/dev/clear-db", async (req, res) => {
  try {

    await sequelize.sync({ force: true });

    res.json({
      msg: "Database cleared successfully"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =====================
// DEV ROUTE: SHOW ALL DB CONTENT
// =====================
app.get("/dev/all", async (req, res) => {
  try {

    const users = await db.User.findAll();
    const requests = await db.Request.findAll();
    const donations = await db.Donation.findAll();
    const categories = await db.Category.findAll();

    res.json({
      users,
      requests,
      donations,
      categories
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =====================
// SERVER + DB
// =====================
const PORT = 5000;

sequelize.sync()
  .then(() => {

    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });