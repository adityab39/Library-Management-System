const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Sample Route
app.get("/", (req, res) => {
  res.send("Library Management System API is running...");
});

// Sync Database
sequelize.sync().then(() => console.log("Database Synced"));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));