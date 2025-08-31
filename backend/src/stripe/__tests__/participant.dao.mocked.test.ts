jest.mock('../models/participant.models');
import Participant from '../models/participant.models';
import { participantDao } from '../daos/participant.dao';
import { DatabaseError, ValidationError, NotFoundError } from '../types/errors.types';
import { Types } from 'mongoose';

describe('participantDao.createParticipant error branches (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DatabaseError if save returns falsy', async () => {
    (Participant.prototype.save as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      participantDao.createParticipant({
        name: 'FailUser',
        surname: 'Test',
        email: 'fail1@example.com',
        transactions: []
      })
    ).rejects.toBeInstanceOf(DatabaseError);
  });

  it('should throw DatabaseError on unexpected error during save', async () => {
    (Participant.prototype.save as jest.Mock).mockRejectedValueOnce(new Error('Boom'));

    await expect(
      participantDao.createParticipant({
        name: 'FailUser2',
        surname: 'Test',
        email: 'fail2@example.com',
        transactions: []
      })
    ).rejects.toBeInstanceOf(DatabaseError);
  });

  it('should throw ValidationError when mongoose throws native ValidationError', async () => {
    const err = new Error('bad email');
    err.name = 'ValidationError';
    (Participant.prototype.save as jest.Mock).mockRejectedValueOnce(err);

    await expect(
      participantDao.createParticipant({
        name: 'Invalid',
        surname: 'Test',
        email: 'bad@example.com',
        transactions: []
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('participantDao other methods error branches (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('findAllParticipants should return empty array', async () => {
    (Participant.find as jest.Mock).mockReturnValueOnce({
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValueOnce([])
    });

    const result = await participantDao.findAllParticipants();
    expect(result).toEqual([]);
  });

  it('findParticipantById should throw NotFoundError if not found', async () => {
    const fakeQuery = {
      populate: () => fakeQuery, // chainable
      then: (resolve: (value: null) => void) => resolve(null), // resolves to null
    };

    (Participant.findById as unknown as jest.Mock).mockReturnValueOnce(fakeQuery);

    await expect(
      participantDao.findParticipantById('507f1f77bcf86cd799439011')
    ).rejects.toBeInstanceOf(NotFoundError);
  });



  it('updateParticipantById should throw NotFoundError if not found', async () => {
    (Participant.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      participantDao.updateParticipantById('507f1f77bcf86cd799439011', { name: 'New' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('addTransactionToParticipant should throw NotFoundError if not found', async () => {
    (Participant.findByIdAndUpdate as jest.Mock).mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(null)
    });

    const fakeParticipantId = new Types.ObjectId();
    const fakeTransactionId = new Types.ObjectId();

    await expect(
      participantDao.addTransactionToParticipant(fakeParticipantId, fakeTransactionId)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('addTransactionToParticipant should return participant if found', async () => {
    const fakeParticipant = {
      _id: new Types.ObjectId(),
      email: 'withtx@example.com',
      transactions: [new Types.ObjectId()]
    };

    (Participant.findByIdAndUpdate as jest.Mock).mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(fakeParticipant)
    });

    const result = await participantDao.addTransactionToParticipant(
      new Types.ObjectId(),
      new Types.ObjectId()
    );

    expect(result).toEqual(fakeParticipant);
  });

  it('findParticipantById should return participant if found', async () => {
    const fakeParticipant = { _id: new Types.ObjectId(), email: 'found@example.com' };

    const fakeQuery = {
      populate: () => fakeQuery, // allow chaining .populate()
      then: (resolve: (val: typeof fakeParticipant) => void) => resolve(fakeParticipant), // resolve to participant
    };

    (Participant.findById as unknown as jest.Mock).mockReturnValueOnce(fakeQuery);

    const result = await participantDao.findParticipantById(fakeParticipant._id.toString());
    expect(result).toEqual(fakeParticipant);
  });
});
