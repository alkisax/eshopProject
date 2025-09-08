"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supertest_1 = __importDefault(require("supertest"));
const bcrypt_1 = require("bcrypt");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const users_models_1 = __importDefault(require("../../login/models/users.models"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const transaction_models_1 = __importDefault(require("../models/transaction.models"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI is required');
}
const TEST_USER = {
    username: 'testuser_tx',
    name: 'Test User',
    email: 'tx_user@example.com',
    password: 'supersecret',
    roles: ['USER'],
};
let token;
let userId;
let participantId;
let commodityId;
describe('GET /api/transaction/participant/:participantId', () => {
    beforeAll(async () => {
        await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
        // Clean slate
        await Promise.all([
            users_models_1.default.deleteMany({}),
            participant_models_1.default.deleteMany({}),
            transaction_models_1.default.deleteMany({}),
            commodity_models_1.default.deleteMany({}),
        ]);
        // Create user
        const hashedPassword = await (0, bcrypt_1.hash)(TEST_USER.password, 10);
        const user = await users_models_1.default.create({
            username: TEST_USER.username,
            name: TEST_USER.name,
            email: TEST_USER.email,
            hashedPassword,
            roles: TEST_USER.roles,
        });
        userId = user._id;
        // Login to get JWT
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({ username: TEST_USER.username, password: TEST_USER.password });
        expect(loginRes.status).toBe(200);
        const loginBody = loginRes.body;
        token = loginBody.data.token;
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(10);
        // Create participant linked to this user
        const participant = await participant_models_1.default.create({
            name: 'Buyer One',
            surname: 'Tester',
            email: 'buyer1@example.com',
            user: userId,
            transactions: [],
        });
        participantId = participant._id;
        // Create a commodity
        const commodity = await commodity_models_1.default.create({
            name: 'Demo Product',
            description: 'For tx tests',
            category: ['test'],
            price: 5,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}`,
            soldCount: 0,
            stock: 50,
            active: true,
            images: [],
        });
        commodityId = commodity._id;
        // Create 2 transactions for this participant (later one should appear first)
        await transaction_models_1.default.create({
            participant: participantId,
            items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 5 }],
            amount: 5,
            processed: false,
            cancelled: false,
            sessionId: `cs_${Date.now()}_a`,
        });
        // ensure different createdAt for sort
        await new Promise((r) => setTimeout(r, 10));
        await transaction_models_1.default.create({
            participant: participantId,
            items: [{ commodity: commodityId, quantity: 2, priceAtPurchase: 5 }],
            amount: 10,
            processed: false,
            cancelled: false,
            sessionId: `cs_${Date.now()}_b`,
        });
    }, 30000);
    afterAll(async () => {
        await Promise.all([
            users_models_1.default.deleteMany({}),
            participant_models_1.default.deleteMany({}),
            transaction_models_1.default.deleteMany({}),
            commodity_models_1.default.deleteMany({}),
        ]);
        await (0, mongoose_1.disconnect)();
    });
    it('returns 401 when no token is provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get(`/api/transaction/participant/${participantId.toString()}`);
        expect(res.status).toBe(401);
    });
    it('returns transactions for the participant (sorted desc, with populated items.commodity)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/transaction/participant/${participantId.toString()}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        const body = res.body;
        expect(body.status).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBe(2);
        // Sorted desc by createdAt → first is the *second* we created (amount 10)
        const [first, second] = body.data;
        // basic shape
        expect(first.amount).toBe(10);
        expect(second.amount).toBe(5);
        // createdAt sorting check
        const firstCreated = new Date(first.createdAt).getTime();
        const secondCreated = new Date(second.createdAt).getTime();
        expect(firstCreated).toBeGreaterThanOrEqual(secondCreated);
        // populated commodity checks
        expect(first.items.length).toBe(1);
        expect(first.items[0].commodity).toBeDefined();
        expect(first.items[0].commodity._id.toString()).toBe(commodityId.toString());
        expect(first.items[0].commodity.name).toBe('Demo Product');
        expect(first.items[0].commodity.price).toBe(5);
        expect(first.items[0].commodity.currency).toBe('eur');
    });
    it('returns an empty list for a participant with no transactions', async () => {
        // create another participant owned by the same user
        const emptyParticipant = await participant_models_1.default.create({
            name: 'NoTx',
            email: 'no-tx@example.com',
            user: userId,
            transactions: [],
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/transaction/participant/${emptyParticipant._id.toString()}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        const body = res.body;
        expect(body.status).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBe(0);
    });
});
//# sourceMappingURL=transaction.get.participant.byParticipantId.test.js.map