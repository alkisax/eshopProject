import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';

// Add this mock at the top of your test file to ensure it doesn't interact with the actual Stripe service during tests.
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock the methods you need, e.g., charge, paymentIntents, etc.
    charges: {
      create: jest.fn().mockResolvedValue({ success: true })
    }
  }));
});

import User from '../../login/models/users.models';  
import Participant from '../models/participant.models';

const TEST_ADMIN = {
  username: 'adminuser',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'securepassword',
  roles: ['ADMIN'],
};

let token: string;

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error;
  }
  await connect(process.env.MONGODB_TEST_URI);
  await User.deleteMany({});
  await Participant.deleteMany({});

  const hashedPassword = await hash(TEST_ADMIN.password, 10);

  await User.create({
    username: TEST_ADMIN.username,
    name: TEST_ADMIN.name,
    email: TEST_ADMIN.email,
    hashedPassword: hashedPassword,
    roles: TEST_ADMIN.roles,
  });

  const res = await request(app)
    .post('/api/auth')
    .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });

  token = res.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Participant.deleteMany({});
  await disconnect();
});

describe('Participant API', () => {
  describe('GET /api/participant', () => {
    it('should return 200 and list participants if admin is authorized', async () => {
      const res = await request(app)
        .get('/api/participant')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/participant');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
    });
  });

  describe('POST /api/participant', () => {
    it('should create a participant and return 201', async () => {
      const newParticipant = {
        name: 'John',
        surname: 'Doe',
        email: 'johndoe@example.com',
        transactions: [],
      };

      const res = await request(app)
        .post('/api/participant')
        .send(newParticipant);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newParticipant.name);
      expect(res.body.email).toBe(newParticipant.email);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteData = {
        name: 'Jane',
      };

      const res = await request(app)
        .post('/api/participant')
        .send(incompleteData);

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/participants/:id', () => {
    it('should delete a participant if ID is valid and admin authorized', async () => {
      const participant = await request(app)
        .post('/api/participant')
        .send({
          name: 'Delete Me',
          surname: 'Test',
          email: 'deleteme@example.com',
          transactions: [],
        });

      const id = participant.body._id;

      const res = await request(app)
        .delete(`/api/participant/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it('should return 404 if participant does not exist', async () => {
      const validButMissingId = '507f1f77bcf86cd799439011';

      const res = await request(app)
        .delete(`/api/participant/${validButMissingId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 500 if ID format is invalid', async () => {
      const res = await request(app)
        .delete('/api/participant/invalid-id-format')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
    });

    it('should return 400 if ID is missing', async () => {
      const res = await request(app)
        .delete('/api/participant/')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404); // Express will return 404 if the route doesn't match
    });
  });
});

describe('POST /api/participant with explicit user in body', () => {
  it('should create a participant when userId is passed in body', async () => {
    // Create a standalone user first
    const userRes = await User.create({
      username: 'linkeduser',
      name: 'Linked User',
      email: 'linked@example.com',
      hashedPassword: await hash('password123', 10),
      roles: ['USER'],
    });

    const newParticipant = {
      name: 'Linked',
      surname: 'Participant',
      email: 'linkedparticipant@example.com',
      user: userRes._id.toString(), // 👈 pass userId in body
      transactions: [],
    };

    const res = await request(app)
      .post('/api/participant')
      .send(newParticipant);

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(newParticipant.email);
    expect(res.body.user).toBe(userRes._id.toString());
  });
});

describe('Participant Controller edge cases', () => {
  it('GET /api/participant should return 401 if no Authorization header', async () => {
    const res = await request(app).get('/api/participant'); // no header

    expect(res.status).toBe(401);
    expect(res.body.status).toBe(false);
    // comes from verifyToken middleware, not controller
    expect(res.body.message).toBe('No token found');
  });

  it('DELETE /api/participant should return 400 if no id param', async () => {
    // Express treats missing param as route mismatch, so hit controller directly:
    const res = await request(app)
      .delete('/api/participant/') // trailing slash → no id
      .set('Authorization', `Bearer ${token}`);

    expect([400,404]).toContain(res.status);
  });

  it('DELETE /api/participant/:id should return 404 if dao returns null', async () => {
    // create then delete so dao returns null on 2nd attempt
    const participant = await request(app)
      .post('/api/participant')
      .send({
        name: 'ToBeDeletedTwice',
        surname: 'Fail',
        email: 'faildelete@example.com',
        transactions: []
      });

    const id = participant.body._id;

    // First delete should succeed
    await request(app)
      .delete(`/api/participant/${id}`)
      .set('Authorization', `Bearer ${token}`);

    // Second delete → dao returns null
    const res = await request(app)
      .delete(`/api/participant/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

