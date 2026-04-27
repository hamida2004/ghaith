require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

const app = express();

// =====================
// MIDDLEWARES
// =====================
app.use(cors());
app.use(express.json());
app.use("/uploads", require("express").static("uploads"));


// =====================
// ROUTES
// =====================
app.use("/auth", require("./routes/auth.routes"));
app.use("/requests", require("./routes/request.routes"));
app.use("/donations", require("./routes/donation.routes"));
app.use("/users", require("./routes/user.routes"));
app.use("/categories", require("./routes/categorie.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));

// =====================
// SERVER + DB
// =====================
const PORT = 5000;

app.get("/dev/clear-db", async (req, res) => {
  try {
 

    await sequelize.sync({ force: true });

    res.json({ msg: "Database cleared successfully" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});
sequelize.sync()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });