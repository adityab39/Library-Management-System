const express = require("express");
const AdminController = require("../controllers/AdminController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/add-book", verifyToken, upload.single("cover_image"), AdminController.addBook);

module.exports = router;

