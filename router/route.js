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
router.post('/patients/:doctorId', doctorController.addPatient);
router.post('/doctors/:doctorId/refer', doctorController.referPatient);
router.get('/doctors/:doctorId/patients', doctorController.getPatients);
router.get('/doctor/:doctorId', doctorController.getDoctorById)
router.get('/patients/reports', doctorController.generateReport)
router.get('/patients/:patientId', doctorController.getPatientById);
router.delete('/patients/:patientId', doctorController.deletePatient);
router.put('/patients/:patientId', doctorController.updatePatient);

module.exports = router