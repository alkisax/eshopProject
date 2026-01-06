import Participant from '../models/participant.models';
import type { ParticipantType, TransactionType } from '../types/stripe.types';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError, DatabaseError } from '../../utils/error/errors.types';
import { IUser } from '../../login/types/user.types';

// create 
const createParticipant = async (participantData: ParticipantType) => {
  const existing = await Participant.findOne({ email: participantData.email });
  if (existing) {
    throw new ValidationError('Participant with this email already exists');
  }

  const participant = new Participant({
    name: participantData.name,
    surname: participantData.surname,
    email: participantData.email,
    user: participantData.user || null,
    transactions: []
  });

  try{
    const response = await participant.save();
    if (!response) {
      throw new DatabaseError('error saving participant');
    }
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message); // will map to 400
    }
    throw new DatabaseError('Unexpected error saving participant');   
  } 
};

//read 
const findAllParticipants = async (page = 0): Promise<ParticipantType[]> => {
  // const response =  await Participant.find().populate<{ transactions: TransactionType[] }>('transactions').limit(50).skip(page * 50);

  const response =  await Participant.find().limit(50).skip(page * 50);
  return response;
};

const findParticipantByEmail = async (email: string): Promise<ParticipantType> => {
  // const response =  await Participant.findOne({ email }).populate<{ transactions: TransactionType[] }>('transactions');
  const response =  await Participant.findOne({ email })
    .populate<{ user: IUser }>('user')
    .populate<{ transactions: TransactionType[] }>('transactions');

  if (!response) {
    throw new NotFoundError('Participant does not exist');
  }
  return response;
};

const findParticipantById = async (id: string): Promise<ParticipantType> => {
  // const response = await Participant.findById(id).populate<{ transactions: TransactionType[] }>('transactions');
  const response = await Participant.findById(id)
    .populate<{ user: IUser }>('user')
    .populate<{ transactions: TransactionType[] }>('transactions');

  if (!response) {
    throw new NotFoundError('Participant does not exist');
  }
  return response;
};


const findParticipantByUserId = async (userId: string) => {
  return Participant.findOne({ user: userId });
};

const updateParticipantById = async (
  id: string,
  updateData: Partial<ParticipantType>
): Promise<ParticipantType> => {
  // Disallow email updates
  const { email, ...allowedData } = updateData;
  if (email) {
    throw new ValidationError('Email cannot be updated');
  }

  // const response = await Participant.findByIdAndUpdate(id, allowedData, { new: true }).populate<{ transactions: TransactionType[] }>('transactions');
  const response = await Participant.findByIdAndUpdate(id, allowedData, { new: true });
  if (!response) {
    throw new NotFoundError('Participant not found');
  }
  return response;
};


const deleteParticipantById = async (id: string): Promise<ParticipantType> => {
  const response = await Participant.findByIdAndDelete(id);
  if (!response) {
    throw new NotFoundError('Participant not found');
  }
  return response;
};

const addTransactionToParticipant = async (participantId: Types.ObjectId, transactionId: Types.ObjectId): Promise<ParticipantType> => {
  const response =  await Participant.findByIdAndUpdate(
    participantId,
    { $push: { transactions: transactionId } },
    { new: true }
  ).populate<{ transactions: TransactionType[] }>('transactions');
  
  if (!response) {
    throw new NotFoundError('Participant not found');
  }

  return response;
};

export const deleteOldGuestParticipants = async (days = 5): Promise<number> => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filter = {
    email: { $regex: /^guest-/ },              // only guest-* emails
    updatedAt: { $lt: cutoff },                // older than N days
    $or: [
      { user: { $exists: false } },            // no user field
      { user: null },                          // explicit null
      // user === '' but only when it's actually stored as a string
      {
        // For each document, compare the field $user with the literal "". If they are equal, it matches. Αυτο προστέθηκε γιατι αρχικά το front μου έφτιαχνε τον guest participant με user: '' και οχι null
        $expr: {
          $and: [
            { $eq: [ { $type: '$user' }, 'string' ] },
            { $eq: [ '$user', '' ] }
          ]
        }
      }
    ]
  };

  // Use the native driver (no Mongoose casting on ObjectId fields)
  const result = await Participant.collection.deleteMany(filter);
  return result.deletedCount ?? 0;
};

export const participantDao = {
  createParticipant,
  findAllParticipants,
  findParticipantByEmail,
  findParticipantById,
  findParticipantByUserId,
  updateParticipantById,
  deleteParticipantById,
  addTransactionToParticipant,
  deleteOldGuestParticipants,
};