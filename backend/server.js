const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const path = require("path"); 
const authRoutes = require("./routes/auth"); 
const memberRoutes = require("./routes/member");
const adminRoutes = require("./routes/admin");


dotenv.config();
const app = express();

app.use(express.json()); 
app.use(cors()); 
app.use(express.urlencoded({ extended: true }));

// Test Database Connection
db.getConnection()
  .then(() => console.log(" MySQL Database Connected"))
  .catch((err) => console.error("Database Connection Failed:", err));

app.use("/api/auth", authRoutes); 
app.use("/api/member", memberRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Library Management System API is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));