// backend/src/login/__tests__/user.appwriteDelete.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import { appwriteUsers } from '../lib/appwrite.client';
import type { Models } from 'node-appwrite';

// ✅ Proper type for Appwrite users
type AppwriteUser = Models.User<Models.Preferences>;

// Factory for fake Appwrite user objects
const fakeAppwriteUser = (
  id: string,
  email = 'fake@example.com'
): AppwriteUser => ({
  $id: id,
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  name: 'Fake User',
  registration: new Date().toISOString(),
  status: true,
  passwordUpdate: new Date().toISOString(),
  email,
  phone: '',
  emailVerification: false,
  phoneVerification: false,
  prefs: {} as Models.Preferences,
  accessedAt: new Date().toISOString(),

  // 👇 extra fields Appwrite expects
  labels: [],
  mfa: false,
  targets: [],
});

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
let userToken = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});

  // 👤 Create admin
  const hashedAdminPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-appwrite',
    hashedPassword: hashedAdminPassword,
    roles: ['ADMIN'],
    email: 'admin-appwrite@example.com',
    name: 'Admin Appwrite',
  });
  adminToken = jwt.sign(
    {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      roles: admin.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // 👤 Normal user
  const hashedUserPassword = await bcrypt.hash('Passw0rd!', 10);
  const normalUser = await User.create({
    username: 'normal-appwrite',
    hashedPassword: hashedUserPassword,
    roles: ['USER'],
    email: 'normal-appwrite@example.com',
    name: 'Normal Appwrite',
  });

  userToken = jwt.sign(
    {
      id: normalUser._id.toString(),
      username: normalUser.username,
      email: normalUser.email,
      roles: normalUser.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('DELETE /api/users/appwrite-delete', () => {
  it('401 if no token', async () => {
    const res = await request(app)
      .delete('/api/users/appwrite-delete')
      .send({ email: 'someone@example.com' });
    expect(res.status).toBe(404);
  });

  it('400 if no email provided', async () => {
    const res = await request(app)
      .delete('/api/users/appwrite-delete')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Email required/);
  });

  it('404 if Appwrite user not found', async () => {
    const spy = jest.spyOn(appwriteUsers, 'list').mockResolvedValueOnce({
      total: 0,
      users: [],
    });

    const res = await request(app)
      .delete('/api/users/appwrite-delete')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'notfound@example.com' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/);

    spy.mockRestore();
  });

  it('200 if Appwrite user deleted successfully', async () => {
    const listSpy = jest.spyOn(appwriteUsers, 'list').mockResolvedValueOnce({
      total: 1,
      users: [fakeAppwriteUser('mock-appwrite-id')],
    });
    const deleteSpy = jest.spyOn(appwriteUsers, 'delete').mockResolvedValueOnce({});

    const res = await request(app)
      .delete('/api/users/appwrite-delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'admin-appwrite@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/deleted/);
    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith('mock-appwrite-id');

    listSpy.mockRestore();
    deleteSpy.mockRestore();
  });
});

describe('DELETE /api/users/appwrite-delete (spy error cases)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 if appwriteUsers.list throws error', async () => {
    jest.spyOn(appwriteUsers, 'list').mockRejectedValueOnce(new Error('List fail'));

    const res = await request(app)
      .delete('/api/users/appwrite-delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'fail-list@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/List fail/);
  });

  it('500 if appwriteUsers.delete throws error', async () => {
    jest.spyOn(appwriteUsers, 'list').mockResolvedValueOnce({
      total: 1,
      users: [fakeAppwriteUser('to-delete-id')],
    });
    jest.spyOn(appwriteUsers, 'delete').mockRejectedValueOnce(new Error('Delete fail'));

    const res = await request(app)
      .delete('/api/users/appwrite-delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'fail-delete@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/Delete fail/);
  });
});
