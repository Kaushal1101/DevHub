// Testcases for user & project flow

// Import libraries and dependencies
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

let mongo;

// Setup in-memory MongoDB and environment variables
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await mongoose.connect(mongo.getUri());
  process.env.JWT_SECRET = 'test_secret';
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

// Integration flow tests for user and project endpoints
describe('User + Project Integration Flow', () => {
  let token, userId, projectId;

  // Register a user and create a project using their token
  it('should register user and create a project', async () => {
    // Register a new user
    const registerRes = await request(app)
      .post('/api/users')
      .send({
        full_name: 'Dev Tester',
        username: 'devtest',
        email: 'dev@test.com',
        password: 'testpass123',
        role: 'student',
        github: 'https://github.com/devtest',
        bio: 'I test DevHub.',
        techstack: ['React', 'Node']
      });

    expect(registerRes.statusCode).toBe(201);
    token = registerRes.body.token;
    userId = registerRes.body._id;

    // Create a project as the authenticated user
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Integrated Test Project',
        desc: 'Created as part of integration test',
        access_type: 'private',
        tech_stack: ['MongoDB', 'Express'],
        tags: ['integration', 'test'],
        features_wanted: [
          { title: 'Real-time chat' },
          { title: 'Contributor roles' }
        ],
        github_repo: {
          url: 'https://github.com/devtest/integration-project',
          repo: 'integration-project',
          owner: 'devtest'
        }
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.creator).toBe(userId);
    projectId = createRes.body._id;
  });

  // Fetch the project using its ID and verify it's created by the same user
  it('should allow the creator to fetch their project by ID', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Integrated Test Project');
    expect(res.body.creator).toBe(userId);
  });

  // Edge case: Access project without token
  it('should deny access to project if no token is provided', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // Edge case: Access project with invalid token
  it('should deny access to project with invalid token', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // Edge case: Try to create project with missing required field
  it('should fail to create project with missing title', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        desc: 'Missing title',
        access_type: 'public',
        tech_stack: ['Express'],
        tags: ['invalid'],
        features_wanted: [ { title: 'none' } ],
        github_repo: {
          url: 'https://github.com/test/missingtitle',
          repo: 'missingtitle',
          owner: 'test'
        }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/missing fields/i);
  });

  // Edge case: Attempt to register with missing fields
  it('should fail to register with missing required fields', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        email: 'missing@test.com'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/all fields/i);
  });

  // Edge case: Attempt to login with incorrect username
  it('should fail login with invalid username', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: 'nonexistentuser',
        password: 'somepassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});
