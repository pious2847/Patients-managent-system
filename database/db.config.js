// src/configs/configs.database.js
const mongoose = require('mongoose');
const config = require("../config");



const ConnectDB = async () => {
  try {
    const uri = process.env.DBConnectionLink || "mongodb+srv://abdulhafis2847:pious2847@hospitalhub.6tewsgp.mongodb.net/";
    console.log("mongodb url" , uri)
    if (!uri) {
      throw new Error('DBConnectionLink is not defined in environment variables');
    }
    await mongoose.connect(uri);
    console.log('---- Database connection successfully ----');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = ConnectDB;