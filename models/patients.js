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
  diagnosis: {
        type: String,
        required: true,
      },
  expenses: [
    {
        date: Date,
        description: String,
        amount: Number
      }
  ],
  status: {
    type: String,
    enum: ['Admitted',  'Discharged'],
    default: 'Admitted'
  }
}, {timeStamp: true});

module.exports = mongoose.model('Patient', PatientSchema);