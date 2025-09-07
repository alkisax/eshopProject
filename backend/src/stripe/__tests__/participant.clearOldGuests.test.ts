import mongoose, { connect, disconnect } from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Participant from '../models/participant.models';
import User from '../../login/models/users.models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { participantDao } from '../daos/participant.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Participant.deleteMany({});
  await User.deleteMany({});

  const plainPassword = 'Passw0rd!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const admin = await User.create({
    username: 'admin1',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin@example.com',
    name: 'Admin User',
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
});

afterAll(async () => {
  await Participant.deleteMany({});
  await User.deleteMany({});
  await disconnect();
  await mongoose.connection.close(); // ✅ ensure mongoose fully closes
});

describe('DELETE /api/participant/clear/old-guests', () => {
  it('should delete guest participants older than 5 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await Participant.create({
      name: '',
      surname: '',
      email: 'guest-123@eshop.local',
      user: null,
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const res = await request(app)
      .delete('/api/participant/clear/old-guests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/guest participants older than 5 days were deleted/);
  });

  it('should not delete recent guest participants', async () => {
    const now = new Date();

    await Participant.create({
      name: '',
      surname: '',
      email: 'guest-456@eshop.local',
      user: null,
      createdAt: now,
      updatedAt: now,
    });

    const res = await request(app)
      .delete('/api/participant/clear/old-guests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/0 guest participants/);
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).delete('/api/participant/clear/old-guests');
    expect(res.status).toBe(401);
  });

  it('should return 500 if DAO throws error', async () => {
    const spy = jest
      .spyOn(Participant.collection, 'deleteMany') // ✅ correct place to mock
      .mockRejectedValueOnce(new Error('DB fail'));

    const res = await request(app)
      .delete('/api/participant/clear/old-guests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);

    spy.mockRestore();
  });
});

describe('participantDAO.deleteOldGuestParticipants', () => {
  it('should delete guest participants older than 5 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await Participant.create({
      name: '',
      surname: '',
      email: 'guest-789@eshop.local',
      user: null,
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const count = await participantDao.deleteOldGuestParticipants(5);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('should not delete participants with real users', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await Participant.create({
      name: 'Real',
      surname: 'User',
      email: 'real@example.com',
      user: new mongoose.Types.ObjectId(),
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const count = await participantDao.deleteOldGuestParticipants(5);
    expect(count).toBe(0);
  });

  it('should return 0 if deleteMany returns undefined deletedCount', async () => {
    const spy = jest
      .spyOn(Participant.collection, 'deleteMany') // ✅ correct place to mock
      .mockResolvedValueOnce({} as mongoose.mongo.DeleteResult);

    const count = await participantDao.deleteOldGuestParticipants(5);
    expect(count).toBe(0);

    spy.mockRestore();
  });

  it('should throw if deleteMany fails', async () => {
    const spy = jest
      .spyOn(Participant.collection, 'deleteMany') // ✅ correct place to mock
      .mockRejectedValueOnce(new Error('DB fail'));

    await expect(participantDao.deleteOldGuestParticipants(5)).rejects.toThrow(
      'DB fail'
    );

    spy.mockRestore();
  });
});

describe('participantDAO.deleteOldGuestParticipants (edge cases)', () => {
  it('should delete old guest with user missing entirely', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await Participant.create({
      email: 'guest-abc@eshop.local',
      updatedAt: oldDate,
      createdAt: oldDate,
    });

    const count = await participantDao.deleteOldGuestParticipants(5);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('should return 0 if nothing matches', async () => {
    const count = await participantDao.deleteOldGuestParticipants(5);
    expect(count).toBe(0);
  });
});
