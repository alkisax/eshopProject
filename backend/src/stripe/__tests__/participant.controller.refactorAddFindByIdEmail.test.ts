// backend/src/participant/__tests__/participant.controller.refactorFetchByIdEmail.test.ts

// Add this mock at the top of your test file to ensure it doesn't interact with the actual Stripe service during tests.
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock the methods you need, e.g., charge, paymentIntents, etc.
    charges: {
      create: jest.fn().mockResolvedValue({ success: true })
    }
  }));
});

import request from 'supertest';
import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../../app';
import Participant from '../models/participant.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI environment variable is required');
}

describe('Participant Controller - findByEmail and findById', () => {
  let participantId: string;
  const testEmail = `test_${Date.now()}@example.com`;

  beforeAll(async () => {
    await connect(process.env.MONGODB_TEST_URI!);
    await Participant.deleteMany({});

    const participant = await Participant.create({
      name: 'Test',
      surname: 'User',
      email: testEmail,
      transactions: [],
    });

    participantId = participant._id.toString();
  });

  afterAll(async () => {
    await Participant.deleteMany({});
    await disconnect();
  });

  describe('GET /api/participant/by-email', () => {
    it('should return participant by email', async () => {
      const res = await request(app)
        .get('/api/participant/by-email')
        .query({ email: testEmail });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app).get('/api/participant/by-email');

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
      expect(res.body.error).toMatch(/Email is required/);
    });

    it('should return 404 if participant not found', async () => {
      const res = await request(app)
        .get('/api/participant/by-email')
        .query({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe(false);
    });
  });

  describe('GET /api/participant/:id', () => {
    it('should return participant by id', async () => {
      const res = await request(app).get(`/api/participant/${participantId}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data._id).toBe(participantId);
    });

    it('should return 404 if participant not found', async () => {
      const res = await request(app).get(
        '/api/participant/507f1f77bcf86cd799439011' // valid ObjectId but not in DB
      );

      expect(res.status).toBe(404);
      expect(res.body.status).toBe(false);
    });
  });
});
