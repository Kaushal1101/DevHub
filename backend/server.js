// Import express and dotenv
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import error handler if server doesn't start properly
const { errorHandler } = require('./middleware/errorMiddleWare');

const { connectDB } = require('./config/db');

// --- Socket.IO ---
const http = require('http');       // core Node server
const { Server } = require('socket.io');  // socket.io server

// Connect to either port 5001 (hidden in env) or 8000
const port = process.env.PORT || 8000;

connectDB();

// Defines express app
const app = express();

/* =========================================================
   1) Wrap Express app inside raw HTTP server
   ========================================================= */
const server = http.createServer(app);

/* =========================================================
   2) Initialise Socket.IO with CORS support
   ========================================================= */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

/* =========================================================
   3) Socket.IO connection handlers
   ========================================================= */
io.on('connection', (socket) => {
  console.log('🔌  New client connected');

  socket.on('setup', (userId) => {
    socket.join(userId);
    socket.emit('connected');
  });

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('typing', (roomId) => socket.to(roomId).emit('typing'));
  socket.on('stopTyping', (roomId) => socket.to(roomId).emit('stopTyping'));

  socket.on('sendMessage', (msg) => {
    io.to(msg.chat).emit('newMessage', msg);
    msg.participants?.forEach((id) => io.to(id).emit('refreshChats'));
  });

  socket.on('disconnect', () => console.log('❌  Client disconnected'));
});

/* =========================================================
   4) Express middleware & routes
   ========================================================= */
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Github OAuth imports
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true when using https in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 5000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/githubAuth'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/features', require('./routes/featureRoutes'));
app.use('/api/github', require('./routes/githubAuth'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Error handler
app.use(errorHandler);

/* =========================================================
   5) Start the *HTTP + Socket* server instead of app.listen
   ========================================================= */
server.listen(port, () =>
  console.log(`Server (REST + Socket.IO) running on port ${port}`)
);

// For testing purposes to export the entire express app
module.exports = app;
