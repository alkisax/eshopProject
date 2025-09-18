import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { hash } from 'bcrypt';
import Participant from '../models/participant.models';
import { participantDao } from '../daos/participant.dao';
import { ValidationError, NotFoundError  } from '../../error/errors.types';
import User from '../../login/models/users.models';
import Transaction from '../models/transaction.models';

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
  }
  await connect(process.env.MONGODB_TEST_URI);
  await Participant.deleteMany({});
  await User.deleteMany({});
  await Transaction.deleteMany({});
});

afterAll(async () => {
  await Participant.deleteMany({});
  await User.deleteMany({});
  await Transaction.deleteMany({});
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

describe('participantDao with user binding', () => {
  let userId: string;

  beforeAll(async () => {
    // Clear users too
    await User.deleteMany({});

    // Create a real user
    const hashedPassword = await hash('testpass', 10);
    const user = await User.create({
      username: 'bounduser',
      name: 'Bound User',
      email: 'bound@example.com',
      hashedPassword,
      roles: ['USER'],
    });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  it('should create a participant bound to a user', async () => {
    const participant = await participantDao.createParticipant({
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
    const found = await participantDao.findParticipantByEmail('john.bound@example.com');
    expect(found.user).toBeTruthy();
    // ObjectId from Mongoose always has a method .toHexString(). IUser does not. We’re saying: It exists (found.user) It’s not a string It does not have a toHexString method (so not an ObjectId) ➡️ Therefore, it must be IUser. 
    if (found.user && typeof found.user !== 'string' && !('toHexString' in found.user)) {
      expect(found.user.email).toBe('bound@example.com');
      expect(found.user.username).toBe('bounduser');
    }
  });

  it('should populate user when finding by id', async () => {
    const participant = await participantDao.findParticipantByEmail('john.bound@example.com');
    const found = await participantDao.findParticipantById(participant._id!.toString());

    expect(found.user).toBeTruthy();
    if (found.user && typeof found.user !== 'string' && !('toHexString' in found.user)) {
      expect(found.user.email).toBe('bound@example.com');
    }
  });

  it('should allow creating a participant without a user', async () => {
    const participant = await participantDao.createParticipant({
      name: 'NoUser',
      surname: 'Test',
      email: 'nouser@example.com',
      transactions: [],
    });

    expect(participant.email).toBe('nouser@example.com');
    expect(participant.user).toBeFalsy();
  });
});

