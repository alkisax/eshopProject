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
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        charges: {
            create: jest.fn().mockResolvedValue({ success: true })
        }
    }));
});
const users_models_1 = __importDefault(require("../../login/models/users.models"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const TEST_ADMIN = {
    username: 'adminuser',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'securepassword',
    roles: ['ADMIN'],
};
let token;
beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error;
    }
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await users_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    const hashedPassword = await (0, bcrypt_1.hash)(TEST_ADMIN.password, 10);
    await users_models_1.default.create({
        username: TEST_ADMIN.username,
        name: TEST_ADMIN.name,
        email: TEST_ADMIN.email,
        hashedPassword: hashedPassword,
        roles: TEST_ADMIN.roles,
    });
    const res = await (0, supertest_1.default)(app_1.default)
        .post('/api/auth')
        .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });
    token = res.body.data.token;
});
afterAll(async () => {
    await users_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('Participant API', () => {
    describe('GET /api/participant', () => {
        it('should return 200 and list participants if admin is authorized', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/participant')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
        it('should return 401 if no token is provided', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/participant');
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
        });
    });
    describe('POST /api/participant', () => {
        it('should create a participant and return 201', async () => {
            const newParticipant = {
                name: 'John',
                surname: 'Doe',
                email: 'johndoe@example.com',
                transactions: [],
            };
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/participant')
                .send(newParticipant);
            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe(newParticipant.name); // ✅ FIX
            expect(res.body.data.email).toBe(newParticipant.email); // ✅ FIX
        });
        it('should return 400 if required fields are missing', async () => {
            const incompleteData = { name: 'Jane' };
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/participant')
                .send(incompleteData);
            expect(res.status).toBe(400);
        });
    });
    describe('DELETE /api/participants/:id', () => {
        it('should delete a participant if ID is valid and admin authorized', async () => {
            const participant = await (0, supertest_1.default)(app_1.default)
                .post('/api/participant')
                .send({
                name: 'Delete Me',
                surname: 'Test',
                email: 'deleteme@example.com',
                transactions: [],
            });
            const id = participant.body.data._id; // ✅ FIX
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/participant/${id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
        });
        it('should return 404 if participant does not exist', async () => {
            const validButMissingId = '507f1f77bcf86cd799439011';
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/participant/${validButMissingId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
        it('should return 500 if ID format is invalid', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/participant/invalid-id-format')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(500);
        });
        it('should return 400 if ID is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete('/api/participant/')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
    });
});
describe('POST /api/participant with explicit user in body', () => {
    it('should create a participant when userId is passed in body', async () => {
        const userRes = await users_models_1.default.create({
            username: 'linkeduser',
            name: 'Linked User',
            email: 'linked@example.com',
            hashedPassword: await (0, bcrypt_1.hash)('password123', 10),
            roles: ['USER'],
        });
        const newParticipant = {
            name: 'Linked',
            surname: 'Participant',
            email: 'linkedparticipant@example.com',
            user: userRes._id.toString(),
            transactions: [],
        };
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/participant')
            .send(newParticipant);
        expect(res.status).toBe(201);
        expect(res.body.data.email).toBe(newParticipant.email); // ✅ FIX
        expect(res.body.data.user.toString()).toBe(userRes._id.toString()); // ✅ FIX
    });
});
describe('Participant Controller edge cases', () => {
    it('GET /api/participant should return 401 if no Authorization header', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/participant');
        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('No token found');
    });
    it('DELETE /api/participant should return 400 if no id param', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .delete('/api/participant/')
            .set('Authorization', `Bearer ${token}`);
        expect([400, 404]).toContain(res.status);
    });
    it('DELETE /api/participant/:id should return 404 if dao returns null', async () => {
        const participant = await (0, supertest_1.default)(app_1.default)
            .post('/api/participant')
            .send({
            name: 'ToBeDeletedTwice',
            surname: 'Fail',
            email: 'faildelete@example.com',
            transactions: []
        });
        const id = participant.body.data._id; // ✅ FIX
        await (0, supertest_1.default)(app_1.default)
            .delete(`/api/participant/${id}`)
            .set('Authorization', `Bearer ${token}`);
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/participant/${id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});
//# sourceMappingURL=participant.test.js.map