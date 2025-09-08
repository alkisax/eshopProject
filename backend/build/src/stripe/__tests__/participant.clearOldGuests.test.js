"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const users_models_1 = __importDefault(require("../../login/models/users.models"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const participant_dao_1 = require("../daos/participant.dao");
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}
let adminToken;
beforeAll(async () => {
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await participant_models_1.default.deleteMany({});
    await users_models_1.default.deleteMany({});
    const plainPassword = 'Passw0rd!';
    const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10);
    const admin = await users_models_1.default.create({
        username: 'admin1',
        hashedPassword,
        roles: ['ADMIN'],
        email: 'admin@example.com',
        name: 'Admin User',
    });
    adminToken = jsonwebtoken_1.default.sign({
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        roles: admin.roles,
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
});
afterAll(async () => {
    await participant_models_1.default.deleteMany({});
    await users_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
    await mongoose_1.default.connection.close(); // ✅ ensure mongoose fully closes
});
describe('DELETE /api/participant/clear/old-guests', () => {
    it('should delete guest participants older than 5 days', async () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);
        await participant_models_1.default.create({
            name: '',
            surname: '',
            email: 'guest-123@eshop.local',
            user: null,
            createdAt: oldDate,
            updatedAt: oldDate,
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .delete('/api/participant/clear/old-guests')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toMatch(/guest participants older than 5 days were deleted/);
    });
    it('should not delete recent guest participants', async () => {
        const now = new Date();
        await participant_models_1.default.create({
            name: '',
            surname: '',
            email: 'guest-456@eshop.local',
            user: null,
            createdAt: now,
            updatedAt: now,
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .delete('/api/participant/clear/old-guests')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toMatch(/0 guest participants/);
    });
    it('should return 401 if no token provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/participant/clear/old-guests');
        expect(res.status).toBe(401);
    });
    it('should return 500 if DAO throws error', async () => {
        const spy = jest
            .spyOn(participant_models_1.default.collection, 'deleteMany') // ✅ correct place to mock
            .mockRejectedValueOnce(new Error('DB fail'));
        const res = await (0, supertest_1.default)(app_1.default)
            .delete('/api/participant/clear/old-guests')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(500);
        spy.mockRestore();
    });
});
describe('participantDAO.deleteOldGuestParticipants', () => {
    it('should delete guest participants older than 5 days', async () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);
        await participant_models_1.default.create({
            name: '',
            surname: '',
            email: 'guest-789@eshop.local',
            user: null,
            createdAt: oldDate,
            updatedAt: oldDate,
        });
        const count = await participant_dao_1.participantDao.deleteOldGuestParticipants(5);
        expect(count).toBeGreaterThanOrEqual(1);
    });
    it('should not delete participants with real users', async () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);
        await participant_models_1.default.create({
            name: 'Real',
            surname: 'User',
            email: 'real@example.com',
            user: new mongoose_1.default.Types.ObjectId(),
            createdAt: oldDate,
            updatedAt: oldDate,
        });
        const count = await participant_dao_1.participantDao.deleteOldGuestParticipants(5);
        expect(count).toBe(0);
    });
    it('should return 0 if deleteMany returns undefined deletedCount', async () => {
        const spy = jest
            .spyOn(participant_models_1.default.collection, 'deleteMany') // ✅ correct place to mock
            .mockResolvedValueOnce({});
        const count = await participant_dao_1.participantDao.deleteOldGuestParticipants(5);
        expect(count).toBe(0);
        spy.mockRestore();
    });
    it('should throw if deleteMany fails', async () => {
        const spy = jest
            .spyOn(participant_models_1.default.collection, 'deleteMany') // ✅ correct place to mock
            .mockRejectedValueOnce(new Error('DB fail'));
        await expect(participant_dao_1.participantDao.deleteOldGuestParticipants(5)).rejects.toThrow('DB fail');
        spy.mockRestore();
    });
});
describe('participantDAO.deleteOldGuestParticipants (edge cases)', () => {
    it('should delete old guest with user missing entirely', async () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);
        await participant_models_1.default.create({
            email: 'guest-abc@eshop.local',
            updatedAt: oldDate,
            createdAt: oldDate,
        });
        const count = await participant_dao_1.participantDao.deleteOldGuestParticipants(5);
        expect(count).toBeGreaterThanOrEqual(1);
    });
    it('should return 0 if nothing matches', async () => {
        const count = await participant_dao_1.participantDao.deleteOldGuestParticipants(5);
        expect(count).toBe(0);
    });
});
//# sourceMappingURL=participant.clearOldGuests.test.js.map