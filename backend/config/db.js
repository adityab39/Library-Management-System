const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: "localhost",      // MySQL server (same as phpMyAdmin)
  user: "root",           // Use your MySQL username
  password: "",           // Leave blank if no password
  database: "library_db", // Database name (must match phpMyAdmin)
  port: 4000,             // Use port 4000 (since MySQL is running here)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to MySQL database:", "library_db");
    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  }
})();

module.exports = db;