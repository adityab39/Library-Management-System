const express = require("express");
const MemberController = require("../controllers/MemberController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/books",MemberController.getAllBooks);
router.get("/books/search", MemberController.searchBooks);
router.post("/books/borrow",MemberController.borrowBook);
router.post("/books/return",MemberController.returnBook);


module.exports = router; 