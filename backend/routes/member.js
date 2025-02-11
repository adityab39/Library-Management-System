const express = require("express");
const MemberController = require("../controllers/MemberController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/books",MemberController.getAllBooks);
router.get("/books/search", MemberController.searchBooks);
router.post("/books/borrow",verifyToken,MemberController.borrowBook);
router.post("/books/return",verifyToken,MemberController.returnBook);
router.get("/books/borrowed",verifyToken,MemberController.getBorrowedbooks);
router.get("/books/history",verifyToken,MemberController.borrowingHistory);
router.post("/books/review",verifyToken,MemberController.reviewBook);
router.get("/books/categories",MemberController.getCategories);
router.get("/books/authors",MemberController.getAuthors);

module.exports = router; 