const express = require("express");
const AdminController = require("../controllers/AdminController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/add-book", verifyToken, upload.single("cover_image"), AdminController.addBook);
router.put("/update-book/:bookId", verifyToken, upload.single("cover_image"), AdminController.updateBook);
router.post("/delete-book", verifyToken, AdminController.deleteBook);
router.get("/get-books", verifyToken, AdminController.getBooks);
router.get("/borrowed-books", verifyToken, AdminController.getBorrowedBooks);
router.post("/restore-book", verifyToken, AdminController.restoreBook);
router.get("/members",verifyToken,AdminController.getAllMembers);
router.post("/delete-member",verifyToken,AdminController.deleteMember);
router.get("/stats", verifyToken, AdminController.getLibraryStats);


module.exports = router;

