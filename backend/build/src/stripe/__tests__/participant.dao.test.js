"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcrypt_1 = require("bcrypt");
const participant_models_1 = __importDefault(require("../models/participant.models"));
const participant_dao_1 = require("../daos/participant.dao");
const errors_types_1 = require("../types/errors.types");
const users_models_1 = __importDefault(require("../../login/models/users.models"));
const transaction_models_1 = __importDefault(require("../models/transaction.models"));
beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await participant_models_1.default.deleteMany({});
    await users_models_1.default.deleteMany({});
    await transaction_models_1.default.deleteMany({});
});
afterAll(async () => {
    await participant_models_1.default.deleteMany({});
    await users_models_1.default.deleteMany({});
    await transaction_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('participantDao', () => {
    it('should create a participant successfully', async () => {
        const participant = await participant_dao_1.participantDao.createParticipant({
            name: 'Jane',
            surname: 'Doe',
            email: 'jane@example.com',
            transactions: []
        });
        expect(participant.email).toBe('jane@example.com');
    });
    it('should throw ValidationError if email already exists', async () => {
        await expect(participant_dao_1.participantDao.createParticipant({
            name: 'Jane 2',
            surname: 'Doe',
            email: 'jane@example.com',
            transactions: []
        })).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
    it('should find participant by email', async () => {
        const found = await participant_dao_1.participantDao.findParticipantByEmail('jane@example.com');
        expect(found).toBeTruthy();
        expect(found.email).toBe('jane@example.com');
    });
    it('should throw NotFoundError for non-existing email', async () => {
        await expect(participant_dao_1.participantDao.findParticipantByEmail('missing@example.com')).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('should update participant name', async () => {
        const participant = await participant_models_1.default.findOne({ email: 'jane@example.com' });
        const updated = await participant_dao_1.participantDao.updateParticipantById(participant._id.toString(), { name: 'Updated' });
        expect(updated.name).toBe('Updated');
    });
    it('should throw ValidationError if trying to update email', async () => {
        const participant = await participant_models_1.default.findOne({ email: 'jane@example.com' });
        await expect(participant_dao_1.participantDao.updateParticipantById(participant._id.toString(), { email: 'new@example.com' })).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
    it('should delete participant by id', async () => {
        const participant = await participant_dao_1.participantDao.createParticipant({
            name: 'ToDelete',
            surname: 'User',
            email: 'todelete@example.com',
            transactions: []
        });
        const deleted = await participant_dao_1.participantDao.deleteParticipantById(participant._id.toString());
        expect(deleted.email).toBe('todelete@example.com');
    });
    it('should throw NotFoundError when deleting non-existent id', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        await expect(participant_dao_1.participantDao.deleteParticipantById(fakeId)).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
});
describe('participantDao with user binding', () => {
    let userId;
    beforeAll(async () => {
        // Clear users too
        await users_models_1.default.deleteMany({});
        // Create a real user
        const hashedPassword = await (0, bcrypt_1.hash)('testpass', 10);
        const user = await users_models_1.default.create({
            username: 'bounduser',
            name: 'Bound User',
            email: 'bound@example.com',
            hashedPassword,
            roles: ['USER'],
        });
        userId = user._id.toString();
    });
    afterAll(async () => {
        await users_models_1.default.deleteMany({});
    });
    it('should create a participant bound to a user', async () => {
        const participant = await participant_dao_1.participantDao.createParticipant({
            name: 'John',
            surname: 'Bound',
            email: 'john.bound@example.com',
            user: userId,
            transactions: [],
        });
        expect(participant.email).toBe('john.bound@example.com');
        expect(participant.user?.toString()).toBe(userId);
    });
    it('should populate user when finding by email', async () => {
        const found = await participant_dao_1.participantDao.findParticipantByEmail('john.bound@example.com');
        expect(found.user).toBeTruthy();
        // ObjectId from Mongoose always has a method .toHexString(). IUser does not. We’re saying: It exists (found.user) It’s not a string It does not have a toHexString method (so not an ObjectId) ➡️ Therefore, it must be IUser. 
        if (found.user && typeof found.user !== 'string' && !('toHexString' in found.user)) {
            expect(found.user.email).toBe('bound@example.com');
            expect(found.user.username).toBe('bounduser');
        }
    });
    it('should populate user when finding by id', async () => {
        const participant = await participant_dao_1.participantDao.findParticipantByEmail('john.bound@example.com');
        const found = await participant_dao_1.participantDao.findParticipantById(participant._id.toString());
        expect(found.user).toBeTruthy();
        if (found.user && typeof found.user !== 'string' && !('toHexString' in found.user)) {
            expect(found.user.email).toBe('bound@example.com');
        }
    });
    it('should allow creating a participant without a user', async () => {
        const participant = await participant_dao_1.participantDao.createParticipant({
            name: 'NoUser',
            surname: 'Test',
            email: 'nouser@example.com',
            transactions: [],
        });
        expect(participant.email).toBe('nouser@example.com');
        expect(participant.user).toBeFalsy();
    });
});
//# sourceMappingURL=participant.dao.test.js.map