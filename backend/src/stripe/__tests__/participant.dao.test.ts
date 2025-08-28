import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Participant from '../models/participant.models';
import { participantDao } from '../daos/participant.dao';
import { ValidationError, NotFoundError  } from '../types/errors.types';

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
  }
  await connect(process.env.MONGODB_TEST_URI);
  await Participant.deleteMany({});
});

afterAll(async () => {
  await Participant.deleteMany({});
  await disconnect();
});

describe('participantDao', () => {
  it('should create a participant successfully', async () => {
    const participant = await participantDao.createParticipant({
      name: 'Jane',
      surname: 'Doe',
      email: 'jane@example.com',
      transactions: []
    });
    expect(participant.email).toBe('jane@example.com');
  });

  it('should throw ValidationError if email already exists', async () => {
    await expect(
      participantDao.createParticipant({
        name: 'Jane 2',
        surname: 'Doe',
        email: 'jane@example.com',
        transactions: []
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should find participant by email', async () => {
    const found = await participantDao.findParticipantByEmail('jane@example.com');
    expect(found).toBeTruthy();
    expect(found.email).toBe('jane@example.com');
  });

  it('should throw NotFoundError for non-existing email', async () => {
    await expect(
      participantDao.findParticipantByEmail('missing@example.com')
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should update participant name', async () => {
    const participant = await Participant.findOne({ email: 'jane@example.com' });
    const updated = await participantDao.updateParticipantById(participant!._id.toString(), { name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('should throw ValidationError if trying to update email', async () => {
    const participant = await Participant.findOne({ email: 'jane@example.com' });
    await expect(
      participantDao.updateParticipantById(participant!._id.toString(), { email: 'new@example.com' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should delete participant by id', async () => {
    const participant = await participantDao.createParticipant({
      name: 'ToDelete',
      surname: 'User',
      email: 'todelete@example.com',
      transactions: []
    });
    const deleted = await participantDao.deleteParticipantById(participant._id.toString());
    expect(deleted.email).toBe('todelete@example.com');
  });

  it('should throw NotFoundError when deleting non-existent id', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    await expect(participantDao.deleteParticipantById(fakeId)).rejects.toBeInstanceOf(NotFoundError);
  });
});

// jest.mock('../models/participant.models');
// import { DatabaseError  } from '../types/errors.types';


// describe('participantDao.createParticipant error branches', () => {
//   afterEach(() => {
//     jest.restoreAllMocks();
//   });

//   it('should throw DatabaseError if save returns falsy', async () => {
//     // Arrange
//     (Participant.prototype.save as jest.Mock).mockResolvedValueOnce(null);

//     // Act & Assert
//     await expect(
//       participantDao.createParticipant({
//         name: 'FailUser',
//         surname: 'Test',
//         email: 'fail1@example.com',
//         transactions: []
//       })
//     ).rejects.toBeInstanceOf(DatabaseError);
//   });

//   it('should throw DatabaseError on unexpected error during save', async () => {
//     // Arrange
//     (Participant.prototype.save as jest.Mock).mockRejectedValueOnce(new Error('Boom'));

//     // Act & Assert
//     await expect(
//       participantDao.createParticipant({
//         name: 'FailUser2',
//         surname: 'Test',
//         email: 'fail2@example.com',
//         transactions: []
//       })
//     ).rejects.toBeInstanceOf(DatabaseError);
//   });
// });
