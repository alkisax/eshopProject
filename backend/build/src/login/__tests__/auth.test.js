"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../utils/appwrite.ts', () => ({
    account: {},
    OAuthProvider: { Google: 'google' },
}));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app_1 = __importDefault(require("../../app"));
const users_models_1 = __importDefault(require("../models/users.models"));
let seededAdmin;
// let adminToken: string;
// let userToken: string;
// let normalUserId: string;
beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    await mongoose_1.default.connect(process.env.MONGODB_TEST_URI);
    await mongoose_1.default.connection.collection('users').deleteMany({});
    // Seed admin user
    const plainPassword = 'Passw0rd!';
    const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10);
    seededAdmin = (await users_models_1.default.create({
        username: 'admin1',
        hashedPassword,
        roles: ['ADMIN'],
        email: 'admin@example.com',
        name: 'Admin User',
    }));
    seededAdmin.passwordPlain = plainPassword;
    // Login seeded admin to get token
    const loginRes = await (0, supertest_1.default)(app_1.default)
        .post('/api/auth')
        .send({
        username: seededAdmin.username,
        password: seededAdmin.passwordPlain,
    });
    expect(loginRes.status).toBe(200);
    // adminToken = loginRes.body.data.token;
    // Create normal user via API (using admin token if needed for authorization)
    const userRes = await (0, supertest_1.default)(app_1.default)
        .post('/api/users/signup/user')
        .send({
        username: 'normaluser',
        password: 'Passw0rd!',
        email: 'normaluser@example.com',
    });
    expect(userRes.status).toBe(201);
    // normalUserId = userRes.body.data.id || userRes.body.data._id;
    // Login normal user to get token
    const loginUserRes = await (0, supertest_1.default)(app_1.default)
        .post('/api/auth')
        .send({ username: 'normaluser', password: 'Passw0rd!' });
    expect(loginUserRes.status).toBe(200);
    // userToken = loginUserRes.body.data.token;
});
afterAll(async () => {
    await mongoose_1.default.connection.collection('users').deleteMany({});
    await mongoose_1.default.disconnect();
});
describe('Auth controller tests', () => {
    describe('POST /api/auth (login)', () => {
        it('should fail if username is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).post('/api/auth').send({ password: 'Passw0rd!' });
            expect(res.status).toBe(400);
            expect(res.body.status).toBe(false);
            expect(res.body.data).toMatch(/username is required/i);
        });
        it('should fail if password is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).post('/api/auth').send({ username: 'admin1' });
            expect(res.status).toBe(400);
            expect(res.body.status).toBe(false);
            expect(res.body.data).toMatch(/password is required/i);
        });
        it('should fail if user not found', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth')
                .send({ username: 'notexist', password: 'Passw0rd!' });
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
            expect(res.body.data).toMatch(/invalid username or password/i);
        });
        it('should fail if password is incorrect', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth')
                .send({ username: 'admin1', password: 'wrongpassword' });
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
            expect(res.body.message || res.body.data).toMatch(/invalid username or password/i);
        });
        it('should login successfully and return token and user info', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth')
                .send({ username: 'admin1', password: 'Passw0rd!' });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toMatchObject({
                username: 'admin1',
                email: 'admin@example.com',
                roles: ['ADMIN'],
            });
        });
    });
    describe('GET /api/auth/google/url/login', () => {
        it('should return google oauth login url', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/google/url/login');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('url');
            expect(res.body.url).toContain('accounts.google.com');
            expect(res.body.url).toContain(process.env.GOOGLE_CLIENT_ID);
        });
    });
    describe('GET /api/auth/google/url/signup', () => {
        it('should return google oauth signup url', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/google/url/signup');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('url');
            expect(res.body.url).toContain('accounts.google.com');
            expect(res.body.url).toContain(process.env.GOOGLE_CLIENT_ID);
        });
    });
});
describe('POST /api/auth/appwrite/sync', () => {
    it('should fail if email is missing', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/appwrite/sync').send({ name: 'New User' });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.data).toMatch(/error fetching user from appwrite/i);
    });
    it('should create a new user and return token', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/appwrite/sync')
            .send({ email: 'appwriteuser@example.com' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.user).toMatchObject({
            username: 'appwriteuser',
            name: 'appwriteuser',
            email: 'appwriteuser@example.com',
            roles: ['USER'],
        });
        // Optional: verify user was actually created in DB
        const dbUser = await users_models_1.default.findOne({ email: 'appwriteuser@example.com' });
        expect(dbUser).not.toBeNull();
    });
    it('should sync an existing user without creating duplicate', async () => {
        // First call to create
        await (0, supertest_1.default)(app_1.default).post('/api/auth/appwrite/sync').send({ name: 'Appwrite User 2', email: 'appwriteuser2@example.com' });
        // Second call should find existing user
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/appwrite/sync').send({ name: 'Appwrite User 2', email: 'appwriteuser2@example.com' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data.user.email).toBe('appwriteuser2@example.com');
        // Check DB: still only 1 user with that email
        const count = await users_models_1.default.countDocuments({ email: 'appwriteuser2@example.com' });
        expect(count).toBe(1);
    });
});
//# sourceMappingURL=auth.test.js.map