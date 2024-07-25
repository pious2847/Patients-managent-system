const mongoose = require('mongoose');
const MedicalRecordSchema = require('./medicalRecord');
const ExpenseSchema = require('./expense');

const PatientSchema = new mongoose.Schema({
  name: String,
  dateOfBirth: Date,
  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  medicalRecords: [
    {
        date: Date,
        diagnosis: String,
        treatment: String,
        notes: String
      }
  ],
  expenses: [
    {
        date: Date,
        description: String,
        amount: Number
      }
  ],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discharged'],
    default: 'Active'
  }
}, {timeStamp: true});

module.exports = mongoose.model('Patient', PatientSchema);