const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  diagnosis: { type: String, required: true },
  expenses: [
    {
      date: { type: Date, required: true },
      description: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ],
  status: {
    type: String,
    enum: ['Admitted', 'Discharged'],
    default: 'Admitted'
  }
});

const Patient = mongoose.model('Patient', patientSchema);

