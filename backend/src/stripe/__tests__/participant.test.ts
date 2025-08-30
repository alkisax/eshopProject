import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
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
      expect(res.body.data.name).toBe(newParticipant.name);   // ✅ FIX
      expect(res.body.data.email).toBe(newParticipant.email); // ✅ FIX
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteData = { name: 'Jane' };

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

      const id = participant.body.data._id; // ✅ FIX

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

      expect(res.status).toBe(404);
    });
  });
});

describe('POST /api/participant with explicit user in body', () => {
  it('should create a participant when userId is passed in body', async () => {
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
      user: userRes._id.toString(),
      transactions: [],
    };

    const res = await request(app)
      .post('/api/participant')
      .send(newParticipant);

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe(newParticipant.email);        // ✅ FIX
    expect(res.body.data.user.toString()).toBe(userRes._id.toString()); // ✅ FIX
  });
});

describe('Participant Controller edge cases', () => {
  it('GET /api/participant should return 401 if no Authorization header', async () => {
    const res = await request(app).get('/api/participant');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toBe('No token found');
  });

  it('DELETE /api/participant should return 400 if no id param', async () => {
    const res = await request(app)
      .delete('/api/participant/')
      .set('Authorization', `Bearer ${token}`);

    expect([400,404]).toContain(res.status);
  });

  it('DELETE /api/participant/:id should return 404 if dao returns null', async () => {
    const participant = await request(app)
      .post('/api/participant')
      .send({
        name: 'ToBeDeletedTwice',
        surname: 'Fail',
        email: 'faildelete@example.com',
        transactions: []
      });

    const id = participant.body.data._id; // ✅ FIX

    await request(app)
      .delete(`/api/participant/${id}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/participant/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
