"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import bcrypt from 'bcrypt';
const mongoose_1 = require("mongoose");
const google_auth_library_1 = require("google-auth-library");
const auth_service_1 = require("../services/auth.service");
const user_dao_1 = require("../dao/user.dao");
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('google-auth-library');
jest.mock('../dao/user.dao');
const mockUserId = new mongoose_1.Types.ObjectId();
// helper: minimal mock user that still matches IUser
const makeMockUser = (overrides = {}) => {
    return {
        _id: mockUserId,
        username: 'u',
        name: 'n',
        email: 'e',
        roles: [],
        hashedPassword: '',
        ...overrides,
    };
};
describe('authService unit tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        delete process.env.JWT_SECRET;
        delete process.env.GOOGLE_CLIENT_ID;
        delete process.env.GOOGLE_CLIENT_SECRET;
    });
    describe('generateAccessToken', () => {
        it('should throw if JWT_SECRET missing', () => {
            delete process.env.JWT_SECRET;
            expect(() => auth_service_1.authService.generateAccessToken(makeMockUser())).toThrow(/JWT secret is not defined/);
        });
        it('should return a token when secret is set', () => {
            process.env.JWT_SECRET = 'testsecret';
            jsonwebtoken_1.default.sign.mockReturnValue('fake.token');
            const token = auth_service_1.authService.generateAccessToken(makeMockUser());
            expect(token).toBe('fake.token');
        });
    });
    describe('verifyAccessToken', () => {
        it('should throw if JWT_SECRET missing', () => {
            expect(() => auth_service_1.authService.verifyAccessToken('token')).toThrow(/JWT secret is not defined/);
        });
        it('should return verified true with valid token', () => {
            process.env.JWT_SECRET = 'testsecret';
            jsonwebtoken_1.default.verify.mockReturnValue({ id: mockUserId });
            const res = auth_service_1.authService.verifyAccessToken('token');
            expect(res.verified).toBe(true);
        });
        it('should return verified false with unknown error object', () => {
            process.env.JWT_SECRET = 'testsecret';
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw 'weird string error';
            });
            const res = auth_service_1.authService.verifyAccessToken('token');
            expect(res).toEqual({ verified: false, data: 'unknown error' });
        });
    });
    describe('verifyAndFetchUser', () => {
        it('should return verified false with unknown error if token invalid', async () => {
            process.env.JWT_SECRET = 'testsecret';
            jest.spyOn(auth_service_1.authService, 'verifyAccessToken').mockReturnValueOnce({ verified: false, data: 'bad token' });
            const res = await auth_service_1.authService.verifyAndFetchUser('fake');
            expect(res).toEqual({ verified: false, reason: 'unknown error' });
        });
        it('should return verified false with unknown error if DAO fails', async () => {
            process.env.JWT_SECRET = 'testsecret';
            jest.spyOn(auth_service_1.authService, 'verifyAccessToken').mockReturnValueOnce({ verified: true, data: { id: mockUserId } });
            user_dao_1.userDAO.readById.mockRejectedValueOnce(new Error('not found'));
            const res = await auth_service_1.authService.verifyAndFetchUser('token');
            expect(res).toEqual({ verified: false, reason: 'unknown error' });
        });
    });
    describe('googleAuth', () => {
        it('should throw if GOOGLE_CLIENT_ID missing', async () => {
            await expect(auth_service_1.authService.googleAuth('code', 'redirect')).rejects.toThrow(/Google Client ID is missing/);
        });
        it('should return error if google getToken fails', async () => {
            process.env.GOOGLE_CLIENT_ID = 'cid';
            process.env.GOOGLE_CLIENT_SECRET = 'secret';
            const mockClient = {
                getToken: jest.fn().mockRejectedValue(new Error('fail')),
            };
            google_auth_library_1.OAuth2Client.mockImplementation(() => mockClient);
            const res = await auth_service_1.authService.googleAuth('code', 'redirect');
            expect(res).toEqual({ error: 'Failed to authenticate with google' });
        });
        it('should succeed and return user & tokens', async () => {
            process.env.GOOGLE_CLIENT_ID = 'cid';
            process.env.GOOGLE_CLIENT_SECRET = 'secret';
            const fakeTokens = { id_token: 'idtoken' };
            const fakePayload = { email: 'user@example.com', name: 'User' };
            const mockClient = {
                getToken: jest.fn().mockResolvedValue({ tokens: fakeTokens }),
                setCredentials: jest.fn(),
                verifyIdToken: jest.fn().mockResolvedValue({
                    getPayload: () => fakePayload,
                }),
            };
            google_auth_library_1.OAuth2Client.mockImplementation(() => mockClient);
            const res = await auth_service_1.authService.googleAuth('code', 'redirect');
            expect(res.user).toEqual(fakePayload);
            expect(res.tokens).toEqual(fakeTokens);
        });
    });
});
//# sourceMappingURL=auth.service.rest.test.js.map