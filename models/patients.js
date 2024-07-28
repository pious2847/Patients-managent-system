const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true }
});

const contactInfoSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true }
});

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  contactInfo: { type: contactInfoSchema, required: true },
  diagnosis: { type: String, required: true },
  expenses: { type: [expenseSchema], required: true },
  status: {
    type: String,
    enum: ['Admitted', 'Discharged'],
    default: 'Admitted'
  }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
