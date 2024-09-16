// controllers/DoctorController.js

const Doctor = require("../models/doctor");
const Patient = require("../models/patients");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const {
  sendResetEmail,
  resetPassword,
  updateUserPassword,
} = require("../utils/MailSender");
const analyzePatientRecords = require('../utils/patientAnalysis');

const doctorController = {
  async register(req, res) {
    try {
      const {
        fullName,
        email,
        password,
        gender,
        cardnumber,
        contactInfo,
        title,
        role,
      } = req.body;

      // Check if Doctor already exists
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        return res.status(400).json({ message: "Doctor already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new Doctor
      const newDoctor = new Doctor({
        fullName,
        email,
        title,
        role,
        cardnumber,
        password: hashedPassword,
        gender,
        contactInfo,
      });

      await newDoctor.save();

      const isverified = await sendResetEmail(email, newDoctor, res);
      if (!isverified) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Check if Doctor exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Create and send token
      const token = jwt.sign({ doctor }, config.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Create a doctor object without the password
      const doctorResponse = doctor.toObject();
      delete doctorResponse.password;

      res.status(200).json({ token, doctor: doctorResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      // Check if user exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isSent = await sendResetEmail(email, doctor, res);
      if (!isSent) {
        return res
          .status(400)
          .json({ message: "Error sending verification code" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async verifyOtpCode(req, res) {
    try {
      const { verificationCode, email } = req.body;
      // Check if Doctor exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const isverified = await resetPassword(verificationCode, doctor._id, res);
      if (!isverified) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async resetPasswords(req, res) {
    try {
      const { email, newPassword } = req.body;
      // Check if Doctor exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isupdated = await updateUserPassword(doctor._id, newPassword, res);
      if (!isupdated) {
        return res
          .status(400)
          .json({
            message: "Unable to change Doctor password. Please try again",
          });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
  async updateDoctor(req, res) {
    try {
      const doctorupdate = await Doctor.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );

      if (!doctorupdate)
        return res
          .status(400)
          .json({ message: "Unable to update doctor. Please try again" });

      return res
        .status(200)
        .json({ message: "Doctor updated successfully", doctorupdate });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getDoctorById(req, res) {
    try {
      const { doctorId } = req.params;

      const doctor = await Doctor.findOne({ _id: doctorId });
      if (!doctor)
        return res.status(400).json({ message: "Patient not found" });
      return res.status(200).json({ doctor });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  
  async addPatient(req, res) {
    try {
      const {
        name,
        dateOfBirth,
        phone,
        email,
        address,
        diagnosis,
        expenses,
        status,
      } = req.body;

      const {doctorId} = req.params
      const doctor = await Doctor.findById(doctorId);
      if(!doctor){
        res.status(404).json({message: "Doctor not found"});
      }
      // Creating a new Patient object
      const newPatient = new Patient({
        name,
        dateOfBirth,
        phone,
        email,
        address,
        diagnosis,
        expenses: parseInt(expenses),
        status: status || "Admitted", // Use the provided status or default to "Admitted"
      });

      // Save the new patient to the database
      await newPatient.save();

      await doctor.patients.push(newPatient._id);
      await doctor.save();

      // Return success response
      return res
        .status(201)
        .json({ message: "Patient added successfully", patient: newPatient });
    } catch (error) {
      console.log(`Error adding patient: ${error.message}`);
      // Check if the error is a validation error
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      // Return error response for other errors
      console.error("Error adding patient:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while adding the patient" });
    }
  },

  async referPatient(req, res) {
    try {
      const { doctorId } = req.params;
      const { referto, patientId } = req.body;

      const fromdoc = await Doctor.findOne({ _id: doctorId });
      if (!fromdoc)
        return res.status(400).json({ message: "Doctor not found" });
      const patient = await Patient.findOne({ _id: patientId });
      if (!patient)
        return res.status(400).json({ message: "Patient not found" });
      const todoc = await Doctor.findOne({ cardnumber: referto });
      if (!todoc) return res.status(400).json({ message: "Doctor not found" });

      await todoc.patients.push(patientId);
      await todoc.save();
      return res.status(200).json({ message: "Patient referred successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getPatients(req, res) {
    try {
      const { doctorId } = req.params;

      // Find the doctor and populate the patients field
      const doctor = await Doctor.findById(doctorId).populate("patients");

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Check if the doctor has any patients
      if (!doctor.patients || doctor.patients.length === 0) {
        return res
          .status(200)
          .json({ message: "No patients found for this doctor", patients: [] });
      }

      // Return the patients
      return res.status(200).json({ patients: doctor.patients });
    } catch (error) {
      console.error("Error in getPatients:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching patients" });
    }
  },

  async getPatientById(req, res) {
    try {
      const { patientId } = req.params;

      const patient = await Patient.findOne({ _id: patientId });
      if (!patient)
        return res.status(400).json({ message: "Patient not found" });
      return res.status(200).json({ patient });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async deletePatient(req, res) {
    try {
      const { patientId } = req.params;
      const patient = await Patient.findOne({ _id: patientId });
      if (!patient)
        return res.status(400).json({ message: "Patient not found" });
      await patient.delete();
      return res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async updatePatient(req, res) {
    try {
      const patient = await Patient.findOne({ _id: req.params });
      if (!patient)
        return res.status(400).json({ message: "Patient not found" });

      const updatedPatient = await Patient.findOneAndUpdate(
        { _id: req.params },
        req.body,
        { new: true }
      );

      if (!updatedPatient)
        return res
          .status(400)
          .json({ message: "Unable to update patient. Please try again" });

      return res
        .status(200)
        .json({ message: "Patient updated successfully", updatedPatient });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async generateReport(req, res){
    try {
      const report = await analyzePatientRecords();
      return res.status(200).json({message: "Analysis completed successfully", report: report})
    } catch (error) {
      console.log(error);
      console.error('Error generating report:', error);
      return res.status(400).json({ message: error.message });
    }
  }
};

module.exports = doctorController;
