const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      require: true,
    },
    cardnumber: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      enum: ["Doctor", "Nurse"],
      required: true,
    },
    role: {
      type: String,
      default: "",
    },
    contactInfo: {
      type: String,
    },
    gender: {
      type: String,
    },
    password: {
      type: String,
      require: true,
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],
  },
  { timeStamp: true }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
