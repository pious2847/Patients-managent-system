// config.js

const config = {
    development: {
      AUTH_EMAIL: "abdulhafis384@gmail.com",
      AUTH_PASS: "hlrr gtdr kkxf bube",
      DBConnectionLink: "mongodb://127.0.0.1:27017/MADRASAHAPI",
      PORT: 8080,
      JWT_SECRET: "your_development_secret_key",
    },
    production: {
      AUTH_EMAIL: "abdulhafis384@gmail.com",
      AUTH_PASS: "hlrr gtdr kkxf bube",
      DBConnectionLink: "mongodb+srv://abdulhafis2847:YwXKPILeI8AJxWzE@hospitalhub.6tewsgp.mongodb.net/hospitalhub",
      PORT: process.env.PORT || 8080,
      JWT_SECRET: "your_production_secret_key",
    },
  };
  
  const env = process.env.NODE_ENV || "development";
  
  module.exports = config[env];
  