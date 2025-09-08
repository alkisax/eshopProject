"use strict";
// backend/src/participant/__tests__/participant.controller.refactorFetchByIdEmail.test.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Add this mock at the top of your test file to ensure it doesn't interact with the actual Stripe service during tests.
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        // Mock the methods you need, e.g., charge, paymentIntents, etc.
        charges: {
            create: jest.fn().mockResolvedValue({ success: true })
        }
    }));
});
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
}
describe('Participant Controller - findByEmail and findById', () => {
    let participantId;
    const testEmail = `test_${Date.now()}@example.com`;
    beforeAll(async () => {
        await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
        await participant_models_1.default.deleteMany({});
        const participant = await participant_models_1.default.create({
            name: 'Test',
            surname: 'User',
            email: testEmail,
            transactions: [],
        });
        participantId = participant._id.toString();
    });
    afterAll(async () => {
        await participant_models_1.default.deleteMany({});
        await (0, mongoose_1.disconnect)();
    });
    describe('GET /api/participant/by-email', () => {
        it('should return participant by email', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/participant/by-email')
                .query({ email: testEmail });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.email).toBe(testEmail);
        });
        it('should return 400 if email is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/participant/by-email');
            expect(res.status).toBe(400);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toMatch(/Email is required/);
        });
        it('should return 404 if participant not found', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/participant/by-email')
                .query({ email: 'nonexistent@example.com' });
            expect(res.status).toBe(404);
            expect(res.body.status).toBe(false);
        });
    });
    describe('GET /api/participant/:id', () => {
        it('should return participant by id', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get(`/api/participant/${participantId}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data._id).toBe(participantId);
        });
        it('should return 404 if participant not found', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/participant/507f1f77bcf86cd799439011' // valid ObjectId but not in DB
            );
            expect(res.status).toBe(404);
            expect(res.body.status).toBe(false);
        });
    });
});
//# sourceMappingURL=participant.controller.refactorAddFindByIdEmail.test.js.map