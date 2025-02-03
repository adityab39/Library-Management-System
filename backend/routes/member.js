const express = require("express");
const MemberController = require("../controllers/MemberController");

const router = express.Router();

router.get("/books",MemberController.getAllBooks);
router.get("/books/search", MemberController.searchBooks);
router.post("/books/borrow",MemberController.borrowBook);

module.exports = router; 