"use strict";
/**
 * @file auth.google.test.ts
 * Tests for Google OAuth login/signup flows with mocked authService and User model
 */
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
const app_1 = __importDefault(require("../../app"));
const auth_service_1 = require("../services/auth.service");
const users_models_1 = __importDefault(require("../models/users.models"));
jest.mock('../services/auth.service', () => ({
    authService: {
        ...jest.requireActual('../services/auth.service').authService,
        googleAuth: jest.fn(),
    },
}));
beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    await mongoose_1.default.connect(process.env.MONGODB_TEST_URI);
    await mongoose_1.default.connection.collection('users').deleteMany({});
});
afterAll(async () => {
    await mongoose_1.default.connection.collection('users').deleteMany({});
    await mongoose_1.default.disconnect();
});
describe('Google OAuth controllers', () => {
    describe('GET /api/auth/google/login', () => {
        it('should return 400 if code is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/google/login');
            expect(res.status).toBe(400);
            expect(res.body.status).toBe(false);
            expect(res.body.data).toMatch(/auth code is missing/i);
        });
        it('should return 401 if googleAuth fails', async () => {
            auth_service_1.authService.googleAuth.mockResolvedValueOnce({ error: 'Failed' });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/google/login?code=fakecode');
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
            expect(res.body.data).toMatch(/google login failed/i);
        });
        it('should redirect to login if user not in DB', async () => {
            auth_service_1.authService.googleAuth.mockResolvedValueOnce({
                user: { email: 'newuser@example.com', name: 'New User' }
            });
            jest.spyOn(users_models_1.default, 'findOne').mockResolvedValueOnce(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/google/login?code=fakecode')
                .expect(302);
            expect(res.header.location).toContain('/login');
        });
        it('should redirect to google-success if user exists', async () => {
            const fakeUser = {
                _id: new mongoose_1.default.Types.ObjectId(),
                roles: ['USER'],
                email: 'existing@example.com',
                name: 'Existing'
            };
            auth_service_1.authService.googleAuth.mockResolvedValueOnce({
                user: { email: fakeUser.email, name: fakeUser.name }
            });
            jest.spyOn(users_models_1.default, 'findOne').mockResolvedValueOnce(fakeUser);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/google/login?code=fakecode')
                .expect(302);
            expect(res.header.location).toContain('/google-success');
            expect(res.header.location).toContain(fakeUser.email);
        });
    });
    describe('GET /api/auth/google/signup', () => {
        it('should return 400 if code is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/google/signup');
            expect(res.status).toBe(400);
            expect(res.body.status).toBe(false);
            expect(res.body.data).toMatch(/auth code is missing/i);
        });
        it('should return 401 if googleAuth fails', async () => {
            auth_service_1.authService.googleAuth.mockResolvedValueOnce({ error: 'Failed' });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/google/signup?code=fakecode');
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
            expect(res.body.data).toMatch(/google login failed/i);
        });
        it('should create a new user if not exists and redirect', async () => {
            const newUserData = { email: 'signupuser@example.com', name: 'Signup User' };
            auth_service_1.authService.googleAuth.mockResolvedValueOnce({ user: newUserData });
            jest.spyOn(users_models_1.default, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(users_models_1.default, 'findOneAndUpdate').mockResolvedValueOnce({
                _id: new mongoose_1.default.Types.ObjectId(),
                email: newUserData.email,
                name: newUserData.name,
                roles: ['user']
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/google/signup?code=fakecode')
                .expect(302);
            expect(res.header.location).toContain('/google-success');
            expect(res.header.location).toContain(newUserData.email);
        });
        it('should redirect existing user with token', async () => {
            const existingUser = {
                _id: new mongoose_1.default.Types.ObjectId(),
                roles: ['USER'],
                email: 'existingsignup@example.com',
                name: 'Existing Signup'
            };
            auth_service_1.authService.googleAuth.mockResolvedValueOnce({
                user: { email: existingUser.email, name: existingUser.name }
            });
            jest.spyOn(users_models_1.default, 'findOne').mockResolvedValueOnce(existingUser);
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/google/signup?code=fakecode')
                .expect(302);
            expect(res.header.location).toContain('/google-success');
            expect(res.header.location).toContain(existingUser.email);
        });
    });
});
//# sourceMappingURL=auth.google.test.js.map