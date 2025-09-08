"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../models/participant.models');
const participant_models_1 = __importDefault(require("../models/participant.models"));
const participant_dao_1 = require("../daos/participant.dao");
const errors_types_1 = require("../types/errors.types");
const mongoose_1 = require("mongoose");
describe('participantDao.createParticipant error branches (unit)', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('should throw DatabaseError if save returns falsy', async () => {
        participant_models_1.default.prototype.save.mockResolvedValueOnce(null);
        await expect(participant_dao_1.participantDao.createParticipant({
            name: 'FailUser',
            surname: 'Test',
            email: 'fail1@example.com',
            transactions: []
        })).rejects.toBeInstanceOf(errors_types_1.DatabaseError);
    });
    it('should throw DatabaseError on unexpected error during save', async () => {
        participant_models_1.default.prototype.save.mockRejectedValueOnce(new Error('Boom'));
        await expect(participant_dao_1.participantDao.createParticipant({
            name: 'FailUser2',
            surname: 'Test',
            email: 'fail2@example.com',
            transactions: []
        })).rejects.toBeInstanceOf(errors_types_1.DatabaseError);
    });
    it('should throw ValidationError when mongoose throws native ValidationError', async () => {
        const err = new Error('bad email');
        err.name = 'ValidationError';
        participant_models_1.default.prototype.save.mockRejectedValueOnce(err);
        await expect(participant_dao_1.participantDao.createParticipant({
            name: 'Invalid',
            surname: 'Test',
            email: 'bad@example.com',
            transactions: []
        })).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
});
describe('participantDao other methods error branches (unit)', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('findAllParticipants should return empty array', async () => {
        participant_models_1.default.find.mockReturnValueOnce({
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockResolvedValueOnce([])
        });
        const result = await participant_dao_1.participantDao.findAllParticipants();
        expect(result).toEqual([]);
    });
    it('findParticipantById should throw NotFoundError if not found', async () => {
        const fakeQuery = {
            populate: () => fakeQuery, // chainable
            then: (resolve) => resolve(null), // resolves to null
        };
        participant_models_1.default.findById.mockReturnValueOnce(fakeQuery);
        await expect(participant_dao_1.participantDao.findParticipantById('507f1f77bcf86cd799439011')).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('updateParticipantById should throw NotFoundError if not found', async () => {
        participant_models_1.default.findByIdAndUpdate.mockResolvedValueOnce(null);
        await expect(participant_dao_1.participantDao.updateParticipantById('507f1f77bcf86cd799439011', { name: 'New' })).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('addTransactionToParticipant should throw NotFoundError if not found', async () => {
        participant_models_1.default.findByIdAndUpdate.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValueOnce(null)
        });
        const fakeParticipantId = new mongoose_1.Types.ObjectId();
        const fakeTransactionId = new mongoose_1.Types.ObjectId();
        await expect(participant_dao_1.participantDao.addTransactionToParticipant(fakeParticipantId, fakeTransactionId)).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('addTransactionToParticipant should return participant if found', async () => {
        const fakeParticipant = {
            _id: new mongoose_1.Types.ObjectId(),
            email: 'withtx@example.com',
            transactions: [new mongoose_1.Types.ObjectId()]
        };
        participant_models_1.default.findByIdAndUpdate.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValueOnce(fakeParticipant)
        });
        const result = await participant_dao_1.participantDao.addTransactionToParticipant(new mongoose_1.Types.ObjectId(), new mongoose_1.Types.ObjectId());
        expect(result).toEqual(fakeParticipant);
    });
    it('findParticipantById should return participant if found', async () => {
        const fakeParticipant = { _id: new mongoose_1.Types.ObjectId(), email: 'found@example.com' };
        const fakeQuery = {
            populate: () => fakeQuery, // allow chaining .populate()
            then: (resolve) => resolve(fakeParticipant), // resolve to participant
        };
        participant_models_1.default.findById.mockReturnValueOnce(fakeQuery);
        const result = await participant_dao_1.participantDao.findParticipantById(fakeParticipant._id.toString());
        expect(result).toEqual(fakeParticipant);
    });
});
//# sourceMappingURL=participant.dao.mocked.test.js.map