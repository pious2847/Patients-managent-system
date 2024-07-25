const express = require("express")
const router = express.Router();
const doctorController = require("../controller/doctors.controller")


router.post("/register", doctorController.register);
router.post("/login", doctorController.login);
router.post("/forgot-password", doctorController.forgotPassword);
router.post("/verify-otp", doctorController.verifyOtpCode)
router.post("/reset-password", doctorController.resetPasswords);


module.exports = router