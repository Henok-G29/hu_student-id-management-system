const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const statisticsRoutes = require("./routes/statistics.routes");
const bot = require("./bot");
const adminRoutes = require("./routes/admin.routes")
const idCardReceiptRouter = require("./routes/idCardReceipt.routes")

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROOT API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HU Student ID Management API is running ...!",
  });
});
// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/id-card-receipts", idCardReceiptRouter);

// START EXPRESS SERVER
app.listen(env.port, () => {
  console.log(`API Server is running on PORT ${env.port}`);

  console.log(`Server Address http://127.0.0.1:${env.port}`);
});

// START TELEGRAM BOT
bot
  .launch()
  .then(() => {
    console.log("Telegram bot is running successfully.");
  })
  .catch((error) => {
    console.error("Telegram bot failed to start:", error);
  });

// GRACEFUL SHUTDOWN
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
