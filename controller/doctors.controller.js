// controllers/DoctorController.js

const Doctor = require('../models/doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config =require("../config")
const {sendResetEmail, resetPassword, updateUserPassword} = require("../utils/MailSender")

const doctorController = {
  async register(req, res) {
    try {
      const { fullName,  email, password, gender, cardnumber, contactInfo, title, role } = req.body;

      // Check if Doctor already exists
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        return res.status(400).json({ message: 'Doctor already exists' });
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

      const isverified = await sendResetEmail(email, newDoctor, res,)
      if(!isverified){
       return res.status(400).json({ message: "Invalid verification code" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Check if Doctor exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create and send token
      const token = jwt.sign({ doctor }, config.JWT_SECRET, { expiresIn: '1d' });

      // Create a doctor object without the password
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(200).json({ token, doctor: doctorResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email} = req.body;
      // Check if user exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isSent = await sendResetEmail(email, doctor, res,)
      if(!isSent){
       return res.status(400).json({ message: "Error sending verification code" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

async verifyOtpCode(req, res) {
    try {
      const { verificationCode, email } = req.body;
      // Check if Doctor exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const isverified = await resetPassword(verificationCode, doctor._id, res,)
      if(!isverified){
       return res.status(400).json({ message: "Invalid verification code" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async resetPasswords(req, res) {
    try {
      const { email,newPassword } = req.body;
      // Check if Doctor exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isupdated = await updateUserPassword(doctor._id, newPassword,res,)
      if(!isupdated){
       return res.status(400).json({ message: "Unable to change Doctor password. Please try again" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = doctorController;