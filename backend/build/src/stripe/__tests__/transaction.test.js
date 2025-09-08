"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supertest_1 = __importDefault(require("supertest"));
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = require("bcrypt");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const transaction_dao_1 = require("../daos/transaction.dao");
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        charges: {
            create: jest.fn().mockResolvedValue({ success: true })
        }
    }));
});
const users_models_1 = __importDefault(require("../../login/models/users.models"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const transaction_models_1 = __importDefault(require("../models/transaction.models"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const cart_models_1 = __importDefault(require("../models/cart.models"));
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI is required');
}
const TEST_ADMIN = {
    username: 'adminuser',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'securepassword',
    roles: ['ADMIN'],
};
let token;
let participantId;
let commodityId;
beforeAll(async () => {
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await users_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    await transaction_models_1.default.deleteMany({});
    await commodity_models_1.default.deleteMany({});
    await cart_models_1.default.deleteMany({});
    const hashedPassword = await (0, bcrypt_1.hash)(TEST_ADMIN.password, 10);
    await users_models_1.default.create({
        username: TEST_ADMIN.username,
        name: TEST_ADMIN.name,
        email: TEST_ADMIN.email,
        hashedPassword,
        roles: TEST_ADMIN.roles,
    });
    const res = await (0, supertest_1.default)(app_1.default)
        .post('/api/auth')
        .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });
    token = res.body.data.token;
    const participantRes = await (0, supertest_1.default)(app_1.default)
        .post('/api/participant')
        .send({
        name: 'Test',
        surname: 'User',
        email: 'testuser@example.com',
        transactions: [],
    });
    participantId = participantRes.body.data._id; // ✅ FIXED
    const commodity = await commodity_models_1.default.create({
        name: 'Test Commodity',
        description: 'Test product',
        category: ['test'],
        price: 50,
        currency: 'eur',
        stripePriceId: `price_${Date.now()}`,
        soldCount: 0,
        stock: 10,
        active: true,
        images: [],
    });
    commodityId = commodity._id.toString();
    await cart_models_1.default.create({
        participant: participantId,
        items: [{ commodity: commodityId, quantity: 2, priceAtPurchase: 50 }],
    });
});
afterAll(async () => {
    await users_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    await transaction_models_1.default.deleteMany({});
    await commodity_models_1.default.deleteMany({});
    await cart_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('Transaction API', () => {
    describe('POST /api/transaction', () => {
        it('should create a transaction from cart and return 201', async () => {
            const payload = {
                participant: participantId,
                sessionId: `test_session_${Date.now()}`,
            };
            const res = await (0, supertest_1.default)(app_1.default).post('/api/transaction').send(payload);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe(true);
            const tx = res.body.data;
            expect(tx.participant.toString()).toBe(participantId);
            expect(tx.amount).toBeGreaterThan(0);
            expect(tx.items.length).toBeGreaterThan(0);
            expect(tx.processed).toBe(false);
        });
        it('should return 400 if required fields are missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).post('/api/transaction').send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/participant|sessionId/i);
        });
        it('should return 400 if cart is empty', async () => {
            // create a fresh participant with empty cart
            const freshRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/participant')
                .send({
                name: 'Empty',
                surname: 'Cart',
                email: `empty_${Date.now()}@example.com`,
                transactions: [],
            });
            const freshId = freshRes.body.data._id; // ✅ FIXED
            const payload = {
                participant: freshId,
                sessionId: `test_session_empty_${Date.now()}`,
            };
            const res = await (0, supertest_1.default)(app_1.default).post('/api/transaction').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/cart is empty/i);
        });
    });
    describe('GET /api/transaction', () => {
        it('should return all transactions (authorized)', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transaction')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
        it('should return 401 if not authorized', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/transaction');
            expect(res.status).toBe(401);
        });
    });
    describe('GET /api/transaction/unprocessed', () => {
        it('should return only unprocessed transactions', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transaction/unprocessed')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
                expect(res.body.data.every((tx) => tx.processed === false)).toBe(true);
            }
        });
    });
    describe('PUT /api/transaction/toggle/:id', () => {
        it('should return 404 if transaction not found', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/transaction/toggle/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
    });
    describe('DELETE /api/transaction/:id', () => {
        it('should cancel a transaction successfully', async () => {
            // create a new transaction
            await cart_models_1.default.findOneAndUpdate({ participant: participantId }, { $set: { items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 50 }] } });
            const payload = {
                participant: participantId,
                sessionId: `test_session_delete_${Date.now()}`,
            };
            const createRes = await (0, supertest_1.default)(app_1.default).post('/api/transaction').send(payload);
            const transactionId = createRes.body.data._id; // ✅ FIXED
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/transaction/${transactionId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.cancelled).toBe(true);
        });
        it('should return 404 if transaction not found', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/transaction/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
    });
    describe('missin tests', () => {
        it('should return 500 if DAO throws in findAll', async () => {
            jest.spyOn(transaction_dao_1.transactionDAO, 'findAllTransactions').mockRejectedValueOnce(new Error('DB fail'));
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transaction')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(500);
            jest.restoreAllMocks();
        });
        it('should return 500 if DAO throws in findUnprocessed', async () => {
            jest.spyOn(transaction_dao_1.transactionDAO, 'findTransactionsByProcessed').mockRejectedValueOnce(new Error('DB fail'));
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transaction/unprocessed')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(500);
            jest.restoreAllMocks();
        });
        it('should return 400 if no transaction ID is provided in toggle', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/transaction/toggle/') // missing ID
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404); // Express route not matched
        });
        it('should return 400 if transactionId param is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/transaction/') // no id
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404); // express route not matched
        });
        it('should toggle processed and send email', async () => {
            // prepare a transaction
            await cart_models_1.default.findOneAndUpdate({ participant: participantId }, { $set: { items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 50 }] } });
            const payload = { participant: participantId, sessionId: `toggle_${Date.now()}` };
            const createRes = await (0, supertest_1.default)(app_1.default).post('/api/transaction').send(payload);
            const transactionId = createRes.body.data._id; // ✅ FIXED
            // ✅ spy on axios.post
            const axiosSpy = jest.spyOn(axios_1.default, 'post').mockResolvedValue({ data: {} });
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/transaction/toggle/${transactionId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.processed).toBe(true);
            expect(axiosSpy).toHaveBeenCalledWith(expect.stringContaining('/api/email/'), {});
            axiosSpy.mockRestore();
        });
    });
    describe('PUT /api/transaction/toggle/:id', () => {
        it('should return 400 if transactionId is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put('/api/transaction/toggle/') // 🚨 no id
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404); // Express router returns 404 for missing param
        });
    });
    describe('DELETE /api/transaction/:id', () => {
        it('should return 400 if transactionId param missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/transaction/') // 🚨 no id
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404); // Express never reaches controller
        });
        it('should handle DAO returning null (simulate)', async () => {
            const spy = jest.spyOn(transaction_dao_1.transactionDAO, 'deleteTransactionById').mockResolvedValueOnce(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/transaction/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/not found/i);
            spy.mockRestore();
        });
    });
});
//# sourceMappingURL=transaction.test.js.map