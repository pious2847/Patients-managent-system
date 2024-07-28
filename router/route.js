const express = require("express")
const router = express.Router();
const doctorController = require("../controller/doctors.controller")


router.post("/register", doctorController.register);
router.post("/login", doctorController.login);
router.post("/forgot-password", doctorController.forgotPassword);
router.post("/verify-otp", doctorController.verifyOtpCode)
router.post("/reset-password", doctorController.resetPasswords)
router.put('/doctors/:id', doctorController.updateDoctor);

// Patient routes
router.post('/patients', patientController.addPatient);
router.post('/doctors/:doctorId/refer', doctorController.referPatient);
router.get('/doctors/:doctorId/patients', doctorController.getPatients);
router.get('/patients/:patientId', patientController.getPatientById);
router.delete('/patients/:patientId', patientController.deletePatient);
router.put('/patients/:patientId', patientController.updatePatient);

module.exports = router