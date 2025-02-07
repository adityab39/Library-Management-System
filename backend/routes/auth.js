const express = require("express");
const AuthController = require("../controllers/AuthController"); 
const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/validate-otp", AuthController.validateOTP);
router.post("/reset-password", AuthController.resetPassword);


module.exports = router;