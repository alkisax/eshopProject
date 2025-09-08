"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ✅ Fake env vars at top
process.env.EMAIL_USER = 'test@mock.com';
process.env.EMAIL_PASS = 'mockpassword';
process.env.EMAIL_EMAILSUBJECT = 'Thank You for Your Donation';
process.env.EMAIL_EMAILTEXTBODY = 'Default body text';
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const email_routes_1 = __importDefault(require("../routes/email.routes"));
const transaction_dao_1 = require("../daos/transaction.dao");
// import nodemailer from 'nodemailer';
// ✅ single consistent mock
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: mockSendMail,
    })),
}));
jest.mock('../daos/transaction.dao.ts');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/email', email_routes_1.default);
describe('POST /api/email/:transactionId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should send thank you email successfully', async () => {
        transaction_dao_1.transactionDAO.findTransactionById.mockResolvedValue({
            _id: 'mockTransactionId',
            participant: {
                _id: 'mockParticipantId',
                email: 'test@example.com',
                name: 'John Doe',
            },
        });
        mockSendMail.mockResolvedValue({
            accepted: ['test@example.com'],
            rejected: [],
            response: '250 OK',
        });
        const res = await (0, supertest_1.default)(app).post('/api/email/mockTransactionId').send({});
        // 🟢 Log response for debugging
        // console.log('TEST DEBUG response.status:', res.status);
        // console.log('TEST DEBUG response.body:', res.body);
        // console.log('TEST DEBUG response.text:', res.text);
        // 🟢 Add explicit checks before fail
        if (res.status !== 200) {
            // console.error('❌ Unexpected response:', {
            //   status: res.status,
            //   body: res.body,
            //   text: res.text,
            // });
        }
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@example.com',
            subject: 'Thank You for Your Donation',
        }));
    });
    it('should return 500 if DAO throws error', async () => {
        transaction_dao_1.transactionDAO.findTransactionById.mockRejectedValue(new Error('DB error'));
        const res = await (0, supertest_1.default)(app).post('/api/email/mockTransactionId').send({});
        expect(res.status).toBe(500);
        expect(res.body.status).toBe(false);
    });
    it('should use subject and body from frontend request if provided', async () => {
        transaction_dao_1.transactionDAO.findTransactionById.mockResolvedValue({
            _id: 'mockTransactionId',
            participant: {
                _id: 'mockParticipantId',
                email: 'test@example.com',
                name: 'Jane Doe',
            },
        });
        mockSendMail.mockResolvedValue({ accepted: ['test@example.com'] });
        const res = await (0, supertest_1.default)(app)
            .post('/api/email/mockTransactionId')
            .send({
            emailSubject: 'Custom Subject',
            emailTextBody: 'Custom body message',
        });
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            subject: 'Custom Subject',
            text: expect.stringContaining('Custom body message'),
        }));
    });
    it('should fall back to default values if env vars are missing', async () => {
        // Temporarily unset env vars
        const oldSubject = process.env.EMAIL_EMAILSUBJECT;
        const oldBody = process.env.EMAIL_EMAILTEXTBODY;
        delete process.env.EMAIL_EMAILSUBJECT;
        delete process.env.EMAIL_EMAILTEXTBODY;
        transaction_dao_1.transactionDAO.findTransactionById.mockResolvedValue({
            _id: 'mockTransactionId',
            participant: {
                _id: 'mockParticipantId',
                email: 'test@example.com',
                name: 'Fallback User',
            },
        });
        mockSendMail.mockResolvedValue({ accepted: ['test@example.com'] });
        const res = await (0, supertest_1.default)(app).post('/api/email/mockTransactionId').send({});
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            subject: 'Thank You', // fallback hardcoded
            text: expect.stringContaining('transaction is being processed'),
        }));
        // Restore env vars
        process.env.EMAIL_EMAILSUBJECT = oldSubject;
        process.env.EMAIL_EMAILTEXTBODY = oldBody;
    });
});
//# sourceMappingURL=email.test.js.map