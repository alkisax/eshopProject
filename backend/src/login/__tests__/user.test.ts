/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config();

import mongoose, { Types } from 'mongoose';
import request from 'supertest';
import app from '../../app';
import bcrypt from 'bcrypt';
import User from '../models/users.models';
import { userDAO } from '../dao/user.dao';

jest.mock('../../utils/appwrite.ts', () => ({
  client: {},
}));

console.log('MONGODB_TEST_URI exists?', !!process.env.MONGODB_TEST_URI);
console.log('JWT_SECRET exists?', !!process.env.JWT_SECRET);

interface AdminUser {
  _id: Types.ObjectId;
  username: string;
  hashedPassword: string;
  roles: string[];
  email: string;
  name: string;
  passwordPlain?: string;
}

let seededAdmin: AdminUser;

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
  }
  try {
    await mongoose.connect(process.env.MONGODB_TEST_URI!);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
  await mongoose.connection.collection('users').deleteMany({});

  const plainPassword = 'Passw0rd!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  seededAdmin = (await User.create({
    username: 'admin1',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin@example.com',
    name: 'Admin User',
  })) as AdminUser;

  seededAdmin.passwordPlain = plainPassword;
  console.log('MongoDB connected:', mongoose.connection.readyState);
  console.log('Seeded admin:', seededAdmin.username, seededAdmin.hashedPassword);
});

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/users/signup/user', () => {
  it('should create a new user with valid data', async () => {
    const res = await request(app).post('/api/users/signup/user').send({
      username: 'testuser',
      password: 'Passw0rd!',
      name: 'Test User',
      email: 'test@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.username).toBe('testuser');

    const savedUser = await User.findOne({ username: 'testuser' });
    expect(savedUser).not.toBeNull();
    expect(savedUser?.hashedPassword).not.toBe('Passw0rd!');
  });

  it('should fail if username already exists', async () => {
    await User.create({
      username: 'duplicate',
      hashedPassword: 'hashedpass',
      name: 'Existing',
      email: 'exist@example.com',
      roles: ['USER'],
    });

    const res = await request(app).post('/api/users/signup/user').send({
      username: 'duplicate',
      password: 'Passw0rd!',
    });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/username/i);
  });

  it('should fail if email already exists', async () => {
    await User.create({
      username: 'user1',
      hashedPassword: 'hashedpass',
      name: 'Existing',
      email: 'usermail@example.com',
      roles: ['USER'],
    });

    const res = await request(app).post('/api/users/signup/user').send({
      username: 'newuser',
      password: 'Passw0rd!',
      email: 'exist@example.com',
    });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/email/i);
  });

  it('should fail if password does not meet requirements', async () => {
    const res = await request(app).post('/api/users/signup/user').send({
      username: 'weakpass',
      password: 'abc',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('should return 500 if DAO.create throws unexpected error', async () => {
    jest.spyOn(userDAO, 'create').mockImplementationOnce(() => {
      throw new Error('Simulated DAO failure');
    });

    const res = await request(app).post('/api/users/signup/user').send({
      username: 'anotheruser',
      password: 'Passw0rd!',
      name: 'Another User',
      email: 'another@example.com',
    });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/Simulated DAO failure/i);
  });

  it('should return 500 if bcrypt.hash throws unexpected error', async () => {
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
      throw new Error('Hashing failed');
    });

    const res = await request(app).post('/api/users/signup/user').send({
      username: 'userhashfail',
      password: 'Passw0rd!',
      name: 'User Fail',
      email: 'userfail@example.com',
    });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/Hashing failed/i);
  });

  it('should return 400 if request body is totally malformed', async () => {
    const res = await request(app).post('/api/users/signup/user').send({ foo: 'bar' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });
});

describe('POST /api/users/signup/admin', () => {
  let adminToken: string;
  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth').send({
      username: 'admin1',
      password: 'Passw0rd!',
    });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.token;
    console.log('\x1b[31m%s\x1b[0m', '***Admin token***:', adminToken);
  });

  it('should create a new admin when authorized', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'admin2',
        password: 'StrongPass1!',
        name: 'Second Admin',
        email: 'admin2@example.com',
        roles: ['ADMIN'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.roles).toContain('ADMIN');
  });

  it('should fail if username already exists', async () => {
    await User.create({
      username: 'existingAdmin',
      hashedPassword: 'hashedpass',
      name: 'Existing Admin',
      email: 'existing@example.com',
      roles: ['ADMIN'],
    });

    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'existingAdmin',
        password: 'Passw0rd!',
      });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/username/i);
  });

  it('should fail if email already exists', async () => {
    await User.create({
      username: 'otheradmin',
      hashedPassword: 'hashedpass',
      name: 'Other Admin',
      email: 'taken@example.com',
      roles: ['ADMIN'],
    });

    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'newadmin',
        password: 'Passw0rd!',
        email: 'taken@example.com',
      });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/email/i);
  });

  it('should fail if password is too weak', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'weakadmin',
        password: 'abc',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('should fail if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: '',
        password: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('should create a new admin when no email is provided (covers `if(email)` false)', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'adminNoEmail',
        password: 'StrongPass1!',
        name: 'No Email Admin',
        roles: ['ADMIN'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.username).toBe('adminNoEmail');
  });

  it('should hit catch block if request body is totally malformed', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ foo: 'bar' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });
});
