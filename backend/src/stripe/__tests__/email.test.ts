// src/stripe/__tests__/email.test.ts

// ✅ Fake env vars at top
process.env.EMAIL_USER = 'test@mock.com';
process.env.EMAIL_PASS = 'mockpassword';
process.env.EMAIL_EMAILSUBJECT = 'Thank You for Your Donation';
process.env.EMAIL_EMAILTEXTBODY = 'Default body text';

import request from 'supertest';
import express from 'express';
import emailRoutes from '../routes/email.routes';
import { transactionDAO } from '../daos/transaction.dao';

// ✅ single consistent nodemailer mock
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

jest.mock('../daos/transaction.dao.ts');

const app = express();
app.use(express.json());
app.use('/api/email', emailRoutes);

// ✅ FULL realistic mock transaction
const mockTransaction = {
  _id: 'mockTransactionId',
  participant: {
    _id: 'mockParticipantId',
    email: 'test@example.com',
    name: 'John Doe',
  },
  items: [
    {
      quantity: 2,
      priceAtPurchase: 10,
      commodity: {
        _id: 'mockCommodityId',
        name: 'Test Product',
      },
    },
  ],
  amount: 20,
};

describe('POST /api/email/:transactionId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send thank you email successfully', async () => {
    (transactionDAO.findTransactionById as jest.Mock).mockResolvedValue(
      mockTransaction
    );

    mockSendMail.mockResolvedValue({
      accepted: ['test@example.com'],
      rejected: [],
      response: '250 OK',
    });

    const res = await request(app).post('/api/email/mockTransactionId').send({});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Thank You for Your Donation',
        text: expect.stringContaining('Test Product'),
      })
    );
  });

  it('should return 500 if DAO throws error', async () => {
    (transactionDAO.findTransactionById as jest.Mock).mockRejectedValue(
      new Error('DB error')
    );

    const res = await request(app).post('/api/email/mockTransactionId').send({});

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
  });

  it('should use subject and body from frontend request if provided', async () => {
    (transactionDAO.findTransactionById as jest.Mock).mockResolvedValue({
      ...mockTransaction,
      participant: {
        ...mockTransaction.participant,
        name: 'Jane Doe',
      },
    });

    mockSendMail.mockResolvedValue({ accepted: ['test@example.com'] });

    const res = await request(app)
      .post('/api/email/mockTransactionId')
      .send({
        emailSubject: 'Custom Subject',
        emailTextBody: 'Custom body message',
      });

    expect(res.status).toBe(200);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Custom Subject',
        text: expect.stringContaining('Custom body message'),
      })
    );
  });

  it('should fall back to default values if env vars are missing', async () => {
    // Temporarily unset env vars
    const oldSubject = process.env.EMAIL_EMAILSUBJECT;
    const oldBody = process.env.EMAIL_EMAILTEXTBODY;
    delete process.env.EMAIL_EMAILSUBJECT;
    delete process.env.EMAIL_EMAILTEXTBODY;

    (transactionDAO.findTransactionById as jest.Mock).mockResolvedValue(
      mockTransaction
    );

    mockSendMail.mockResolvedValue({ accepted: ['test@example.com'] });

    const res = await request(app).post('/api/email/mockTransactionId').send({});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Thank You',
        text: expect.stringContaining('transaction is being processed'),
      })
    );

    // Restore env vars
    process.env.EMAIL_EMAILSUBJECT = oldSubject;
    process.env.EMAIL_EMAILTEXTBODY = oldBody;
  });
});
