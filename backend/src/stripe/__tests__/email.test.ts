import request from 'supertest';
import express from 'express';
import emailRoutes from '../routes/email.routes'; // adjust path if needed
import { transactionDAO } from '../daos/transaction.dao';
import nodemailer from 'nodemailer';

jest.mock('../daos/transaction.dao.ts');
jest.mock('nodemailer');

const app = express();
app.use(express.json());
app.use('/api/email', emailRoutes);

describe('POST /api/email/:transactionId', () => {
  const mockSendMail = jest.fn();

  beforeAll(() => {
    // Mock nodemailer transport
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send thank you email successfully', async () => {
    // Mock DAO to return a transaction with populated participant
    (transactionDAO.findTransactionById as jest.Mock).mockResolvedValue({
      _id: 'mockTransactionId',
      participant: {
        email: 'test@example.com',
        name: 'John Doe',
      },
    });

    // Mock nodemailer sendMail
    mockSendMail.mockResolvedValue({ accepted: ['test@example.com'] });

    const res = await request(app)
      .post('/api/email/mockTransactionId')
      .send();

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Thank You for Your Donation',
      })
    );
  });

  it('should return 500 if DAO throws error', async () => {
    (transactionDAO.findTransactionById as jest.Mock).mockRejectedValue(
      new Error('DB error')
    );

    const res = await request(app)
      .post('/api/email/mockTransactionId')
      .send();

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
  });
});
