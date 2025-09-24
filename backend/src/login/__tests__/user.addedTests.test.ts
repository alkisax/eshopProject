import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../models/users.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
let userToken = '';
let adminId = '';
let userId = '';
let thirdUserId = '';
let thirdUserToken = '';
// eslint-disable-next-line no-console
console.log (adminId, thirdUserToken, thirdUserId);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});

  // 👤 Admin
  const admin = await User.create({
    username: 'admin-tests',
    hashedPassword: await bcrypt.hash('Passw0rd!', 10),
    roles: ['ADMIN'],
    email: 'admin-tests@example.com',
    name: 'Admin Test',
  });
  adminId = admin._id.toString();
  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // 👤 Normal user
  const user = await User.create({
    username: 'normal-tests',
    hashedPassword: await bcrypt.hash('Passw0rd!', 10),
    roles: ['USER'],
    email: 'normal-tests@example.com',
    name: 'Normal Test',
  });
  userId = user._id.toString();
  userToken = jwt.sign(
    { id: user._id.toString(), username: user.username, email: user.email, roles: user.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // 👤 Third user for "wrong user" test
  const third = await User.create({
    username: 'third-tests',
    hashedPassword: await bcrypt.hash('Passw0rd!', 10),
    roles: ['USER'],
    email: 'third-tests@example.com',
    name: 'Third User',
  });
  thirdUserId = third._id.toString();
  thirdUserToken = jwt.sign(
    { id: third._id.toString(), username: third.username, email: third.email, roles: third.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/users/signup/admin', () => {
  it('400 if missing username or password', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Validation/i);
  });

  it('409 if username already exists', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'admin-tests', password: 'Passw0rd!' });
    expect(res.status).toBe(409);
  });

  it('201 if valid → creates admin', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'new-admin', password: 'Passw0rd!' });
    expect(res.status).toBe(201);
    expect(res.body.data.roles).toContain('ADMIN');
  });
});

describe('GET /api/users', () => {
  it('200 returns users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('handles DAO error gracefully', async () => {
    jest.spyOn(User, 'find').mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
    jest.restoreAllMocks();
  });
});

describe('GET /api/users/:id', () => {
  // it('400 if empty id param', async () => {
  //   const res = await request(app).get('/api/users/').set('Authorization', `Bearer ${adminToken}`);
  //   expect([400, 404]).toContain(res.status);
  // });

  it('200 if valid id', async () => {
    const res = await request(app).get(`/api/users/${userId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });
});

describe('GET /api/users/username/:username', () => {
  it('400/500 if no username provided', async () => {
    const res = await request(app).get('/api/users/username/').set('Authorization', `Bearer ${adminToken}`);
    expect([400, 404, 500]).toContain(res.status);
  });

  it('200 returns user', async () => {
    const res = await request(app)
      .get('/api/users/username/normal-tests')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe('normal-tests');
  });
});

describe('GET /api/users/email/:email', () => {
  it('400/500 if no email provided', async () => {
    const res = await request(app).get('/api/users/email/').set('Authorization', `Bearer ${adminToken}`);
    expect([400, 404, 500]).toContain(res.status);
  });

  it('404 if user not found', async () => {
    const res = await request(app)
      .get('/api/users/email/notfound@example.com')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('200 returns user', async () => {
    const res = await request(app)
      .get('/api/users/email/normal-tests@example.com')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('normal-tests@example.com');
  });
});

describe('PUT /api/users/toggle-admin/:id', () => {
  it('401 if no token', async () => {
    const res = await request(app).put(`/api/users/toggle-admin/${userId}`);
    expect(res.status).toBe(401);
  });

  it('403 if self demotion attempt (middleware stops non-admin)', async () => {
    const res = await request(app)
      .put(`/api/users/toggle-admin/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('200 toggles role by admin', async () => {
    const res = await request(app)
      .put(`/api/users/toggle-admin/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.roles).toEqual(['ADMIN']);
  });
});

describe('PUT /api/users/:id', () => {
  it('401 if no token', async () => {
    const res = await request(app).put(`/api/users/${userId}`);
    expect(res.status).toBe(401);
  });

  // it('403 if wrong user (not admin)', async () => {
  //   const res = await request(app)
  //     .put(`/api/users/${thirdUserId}`)
  //     .set('Authorization', `Bearer ${userToken}`)
  //     .send({ name: 'Hacker' });
  //   expect(res.status).toBe(403);
  // });

  it('400 if invalid body (fails zod)', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: '' });
    expect(res.status).toBe(400);
  });

  it('200 updates user self', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated User' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated User');
  });

  it('409 if username already exists', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'admin-tests' });
    expect(res.status).toBe(409);
  });
});
