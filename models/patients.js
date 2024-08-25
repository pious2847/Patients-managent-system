const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  diagnosis: { type: String, required: true },
  expenses: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Admitted", "Discharged"],
    default: "Admitted",
    trim: true
  },
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient
