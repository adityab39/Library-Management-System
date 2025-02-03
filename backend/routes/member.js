const express = require("express");
const MemberController = require("../controllers/MemberController");

const router = express.Router();

router.get("/books",MemberController.getAllBooks);

module.exports = router; 