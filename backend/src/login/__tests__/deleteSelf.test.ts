import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import { userDAO } from '../dao/user.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let userId = '';
let userToken = '';
let otherUserId = '';
let otherToken = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);

  const user = await User.create({
    username: 'self-del',
    hashedPassword,
    roles: ['USER'],
    email: 'selfdel@example.com',
    name: 'Self Del',
  });
  userId = user._id.toString();
  userToken = jwt.sign(
    {
      id: userId,
      username: user.username,
      roles: user.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const other = await User.create({
    username: 'other-del',
    hashedPassword,
    roles: ['USER'],
    email: 'otherdel@example.com',
    name: 'Other Del',
  });
  otherUserId = other._id.toString();
  otherToken = jwt.sign(
    {
      id: otherUserId,
      username: other.username,
      roles: other.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('DELETE /api/users/self/:id', () => {
  it('200 deletes self', async () => {
    const res = await request(app)
      .delete(`/api/users/self/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    const exists = await User.findById(userId);
    expect(exists).toBeNull();
  });

  it('403 cannot delete another user', async () => {
    const res = await request(app)
      .delete(`/api/users/self/${userId}`) // try to delete first user again
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('401 no token', async () => {
    const res = await request(app).delete(`/api/users/self/${otherUserId}`);
    expect(res.status).toBe(401);
  });

  it('401 invalid token', async () => {
    const res = await request(app)
      .delete(`/api/users/self/${otherUserId}`)
      .set('Authorization', 'Bearer not.a.valid.token');
    expect(res.status).toBe(401);
  });

  it('403 invalid id format', async () => {
    const res = await request(app)
      .delete('/api/users/self/not-an-id')
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });
});

describe('DAO errors with spyOn', () => {
  it('500 when DAO throws', async () => {
    const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
    const tempUser = await User.create({
      username: 'spy-del',
      hashedPassword,
      roles: ['USER'],
      email: 'spy@example.com',
      name: 'Spy Del',
    });

    const spy = jest
      .spyOn(userDAO, 'deleteById')
      .mockRejectedValue(new Error('DB fail'));

    const tempToken = jwt.sign(
      { id: tempUser._id.toString(), username: tempUser.username, roles: tempUser.roles },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .delete(`/api/users/self/${tempUser._id.toString()}`)
      .set('Authorization', `Bearer ${tempToken}`);
    expect(res.status).toBe(500);

    spy.mockRestore();
  });
});
