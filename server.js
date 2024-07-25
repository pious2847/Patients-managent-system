require('dotenv').config();
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const config =require("./config")
const userRoutes = require('./router/route');
const notFoundHandler = require('./handlers/404');
const {validationErrorHandler, errorHandler} = require('./handlers/400');

const app = express();
let server;

// Use MongoStore as session store
const sessionConnectionUri = config.DBConnectionLink || "mongodb+srv://abdulhafis2847:YwXKPILeI8AJxWzE@hospitalhub.6tewsgp.mongodb.net/";
app.use(session({
  secret: 'Secret_Key',
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: sessionConnectionUri
  })
}));

// Middleware to parse JSON bodies
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(cors());

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// custom database config imports
require('./database/db.config')();



// measuring the speed of site load
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} took ${duration}ms timestamp ${new Date()}`);
  });
  next();
});

// settings for using routes
app.use('/api/user', userRoutes);

// 404 handler
app.use(notFoundHandler);

// Validation error handler
app.use(validationErrorHandler);

// General error handler
app.use(errorHandler);

// ===============Handling UncaughtExceptions ======================//
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("UNHANDLED EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

startServer();
// Function to handle server and database connections
async function startServer() {
  const PORT = config.PORT || 8080;
  try {
    // Start the HTTP server (which also starts the WebSocket server)
    server =  app.listen(PORT, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`----Server running on http://localhost:${PORT} ----`);
      }
    });
      
  } catch (err) {
    console.error("Server connection error:", err);
    process.exit(1); // Exit the application with an error code
  }
}

// ===============Handling UnhandledRejection======================//
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => {
      process.exit(1);
  });
});

