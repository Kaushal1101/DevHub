// Testcases for User Authentication 

// Import libraries and dependencies
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

let mongo;

// Setup before running tests
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await mongoose.connect(mongo.getUri());
  process.env.JWT_SECRET = 'test_secret'; // set env secret key for JWT
});

// Teardown after all tests complete
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

// Test suite for user-related routes
describe('User Auth Routes', () => {
  let token, userId;

  // Register a user successfully
  it('should register a user successfully', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        full_name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'student',
        github: 'https://github.com/testuser',
        bio: 'I am a test user.',
        techstack: ['Node.js', 'React']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    userId = res.body._id;
  });

  // Prevent duplicate email registration
  it('should not register duplicate email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        full_name: 'Another User',
        username: 'anotheruser',
        email: 'test@example.com', // duplicate email
        password: '123',
        role: 'student',
        github: 'https://github.com/anotheruser',
        bio: 'duplicate user',
        techstack: ['Node.js']
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // Successfully log in a user
  it('should login the user', async () => {
    const user = await User.findOne({ email: 'test@example.com' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: user.username, password: 'hashedpassword123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // Fail login with incorrect password
  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  // Get current user profile using JWT token
  it('should get current user data using token', async () => {
    const user = await User.findOne({ username: 'testuser' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });
});
