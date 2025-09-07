import mongoose, { connect, disconnect } from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Transaction from '../models/transaction.models';

import User from '../../login/models/users.models';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { transactionDAO } from '../daos/transaction.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Transaction.deleteMany({});
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
  await Transaction.deleteMany({});
  await User.deleteMany({});
  await disconnect();
});

describe('DELETE /api/transaction/clear/old', () => {
  it('should delete processed transactions older than 5 years', async () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 10); // make it 10 years old

    await Transaction.create({
      participant: new mongoose.Types.ObjectId(),
      items: [],
      amount: 10,
      processed: true,
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const res = await request(app)
      .delete('/api/transaction/clear/old')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/transactions older than 5 years were deleted/);
  });


  it('should not delete recent processed transactions', async () => {
    const now = new Date();

    await Transaction.create({
      participant: new mongoose.Types.ObjectId(),
      items: [],
      amount: 20,
      processed: true,
      createdAt: now,
      updatedAt: now,
    });

    const res = await request(app)
      .delete('/api/transaction/clear/old')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/0 processed transactions/);
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).delete('/api/transaction/clear/old');
    expect(res.status).toBe(401);
  });

  it('should return 500 if DAO throws error', async () => {
    const spy = jest
      .spyOn(Transaction, 'deleteMany')
      .mockRejectedValueOnce(new Error('DB fail'));

    const res = await request(app)
      .delete('/api/transaction/clear/old')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);

    spy.mockRestore();
  });
});

describe('transactionDAO.deleteOldProcessedTransactions', () => {
  it('should not delete unprocessed transactions', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await Transaction.create({
      participant: new mongoose.Types.ObjectId(),
      items: [],
      amount: 40,
      processed: false,
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const count = await transactionDAO.deleteOldProcessedTransactions(5);
    expect(count).toBe(0);
  });

  it('should return 0 if deleteMany returns undefined deletedCount', async () => {
    const spy = jest
      .spyOn(Transaction, 'deleteMany')
      .mockResolvedValueOnce({} as mongoose.mongo.DeleteResult);

    const count = await transactionDAO.deleteOldProcessedTransactions(5);
    expect(count).toBe(0);

    spy.mockRestore();
  });

  it('should throw if deleteMany fails', async () => {
    const spy = jest
      .spyOn(Transaction, 'deleteMany')
      .mockRejectedValueOnce(new Error('DB fail'));

    await expect(transactionDAO.deleteOldProcessedTransactions(5)).rejects.toThrow(
      'DB fail'
    );

    spy.mockRestore();
  });
});

