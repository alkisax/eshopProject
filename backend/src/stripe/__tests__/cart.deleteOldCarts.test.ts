import mongoose, { connect, disconnect } from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Cart from '../models/cart.models';
import User from '../../login/models/users.models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cartDAO } from '../daos/cart.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Cart.deleteMany({});
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
  await Cart.deleteMany({});
  await User.deleteMany({});
  await disconnect();
});

describe('DELETE /api/cart/clear/old', () => {
  it('should delete carts older than 5 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await Cart.create({
      participant: new mongoose.Types.ObjectId(),
      items: [],
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const res = await request(app)
      .delete('/api/cart/clear/old')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/carts older than 5 days were deleted/);
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).delete('/api/cart/clear/old');
    expect(res.status).toBe(401);
  });

  it('should return 500 if DAO throws error', async () => {
    const spy = jest
      .spyOn(Cart, 'deleteMany')
      .mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app)
      .delete('/api/cart/clear/old')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});

describe('cartDAO.deleteOldCarts', () => {
  it('should delete carts older than 5 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await Cart.create({
      participant: new mongoose.Types.ObjectId(),
      items: [],
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const count = await cartDAO.deleteOldCarts(5);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('should not delete carts newer than 5 days', async () => {
    const recentDate = new Date();

    await Cart.create({
      participant: new mongoose.Types.ObjectId(),
      items: [],
      createdAt: recentDate,
      updatedAt: recentDate,
    });

    const count = await cartDAO.deleteOldCarts(5);
    expect(count).toBe(0);
  });

  it('should return 0 if deleteMany returns undefined deletedCount', async () => {
    const spy = jest.spyOn(Cart, 'deleteMany').mockResolvedValueOnce({} as any);

    const count = await cartDAO.deleteOldCarts(5);
    expect(count).toBe(0);

    spy.mockRestore();
  });

  it('should throw if deleteMany fails', async () => {
    const spy = jest.spyOn(Cart, 'deleteMany').mockRejectedValueOnce(new Error('DB fail'));

    await expect(cartDAO.deleteOldCarts(5)).rejects.toThrow('DB fail');

    spy.mockRestore();
  });
});