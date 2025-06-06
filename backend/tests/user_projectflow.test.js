// Testcases for user & project flow

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await mongoose.connect(mongo.getUri());
  process.env.JWT_SECRET = 'test_secret';
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

describe('User + Project Integration Flow', () => {
  let token, userId, projectId;

  // Registering a user and creating a project using their token
  it('should register user and create a project', async () => {
    // Registering a new user
    const registerRes = await request(app)
      .post('/api/users')
      .send({
        full_name: 'Dev Tester',
        username: 'devtest',
        email: 'dev@test.com',
        password: 'testpass123',
        role: 'Student',
        github: 'https://github.com/devtest',
        bio: 'I test DevHub.',
        techstack: ['React', 'Node']
      });

    expect(registerRes.statusCode).toBe(201); 
    userId = registerRes.body._id;

    // Creating a project as the user
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

  // Fetching the project using its ID and verifying that it's created by the same user
  it('should allow the creator to fetch their project by ID', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Integrated Test Project');
    expect(res.body.creator._id).toBe(userId);
  });

  // Accessng project without token
  it('should deny access to project if no token is provided', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // Accessing project with invalid token
  it('should deny access to project with invalid token', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // Trying to create project with missing required field
  it('should fail to create project with missing title', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        // Missing title field
        desc: 'Missing title',
        access_type: 'public',
        tech_stack: ['Express'],
        tags: ['invalid'],
        features_wanted: [{ title: 'none' }],
        github_repo: {
          url: 'https://github.com/test/missingtitle',
          repo: 'missingtitle',
          owner: 'test'
        }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/missing fields/i);
  });

  // Registering with missing fields
  it('should fail to register with missing required fields', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        email: 'missing@test.com'
        // Missing full_name, username, password, role
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/all fields/i);
  });

  // Logging in with incorrect username
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
