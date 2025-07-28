// Import express and dotenv
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const cookieParser = require('cookie-parser');

// Import error handler if server doesn't start properly
const {errorHandler} = require("./middleware/errorMiddleware");

const { connectDB } = require('./config/db');

// Connect to either port 5001 (hidden in env) or 8000
const port = process.env.PORT || 8000;

connectDB();

// Defines express app
const app = express();

// CORS needed for backend and frontend to successfully connect 
app.use(cors());


app.use(express.json());

// Use normal parser url
app.use(express.urlencoded({ extended: false }))

// Helps us access cookies
app.use(cookieParser());

// Github OAuth imports
const session = require('express-session');
const passport = require('passport');
// Github strategy config
require('./config/passport');

// Creates a server side session to store github access token
// More secure than client side local storage
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Change to true when deployed
      secure: false, 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 5000, 
    },
  })
);

// Allows us to create cookies


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/githubAuth'));

// Get all CRUD functions from project Routes 
app.use('/api/projects', require('./routes/projectRoutes'));

app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/proposals', require('./routes/proposalRoutes'));

app.use('/api/features', require('./routes/featureRoutes'));

app.use('/api/github', require('./routes/githubAuth'));

app.use(errorHandler);

app.listen(port, () => console.log(`server started on port ${port}`));

// For testing purposes to export the entire express app
module.exports = app
