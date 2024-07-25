// config.js

const config = {
    development: {
      AUTH_EMAIL: "abdulhafis384@gmail.com",
      AUTH_PASS: "hlrr gtdr kkxf bube",
      DBConnectionLink: "mongodb+srv://abdulhafis2847:pious2847@hospitalhub.6tewsgp.mongodb.net/",
      PORT: 8080,
      JWT_SECRET: "ecret_key",
    },
    production: {
      AUTH_EMAIL: "abdulhafis384@gmail.com",
      AUTH_PASS: "hlrr gtdr kkxf bube",
      DBConnectionLink: "mongodb+srv://abdulhafis2847:pious2847@hospitalhub.6tewsgp.mongodb.net/",
      PORT: 8080,
      JWT_SECRET: "secret_key",
    },
  };
  
  const env = process.env.NODE_ENV || "development";
  
  module.exports = config[env];
  