"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.participantDao = exports.deleteOldGuestParticipants = void 0;
const participant_models_1 = __importDefault(require("../models/participant.models"));
const errors_types_1 = require("../types/errors.types");
// create 
const createParticipant = async (participantData) => {
    const existing = await participant_models_1.default.findOne({ email: participantData.email });
    if (existing) {
        throw new errors_types_1.ValidationError('Participant with this email already exists');
    }
    const participant = new participant_models_1.default({
        name: participantData.name,
        surname: participantData.surname,
        email: participantData.email,
        user: participantData.user || null,
        transactions: []
    });
    try {
        const response = await participant.save();
        if (!response) {
            throw new errors_types_1.DatabaseError('error saving participant');
        }
        return response;
    }
    catch (err) {
        if (err instanceof Error && err.name === 'ValidationError') {
            throw new errors_types_1.ValidationError(err.message); // will map to 400
        }
        throw new errors_types_1.DatabaseError('Unexpected error saving participant');
    }
};
//read 
const findAllParticipants = async (page = 0) => {
    // const response =  await Participant.find().populate<{ transactions: TransactionType[] }>('transactions').limit(50).skip(page * 50);
    const response = await participant_models_1.default.find().limit(50).skip(page * 50);
    return response;
};
const findParticipantByEmail = async (email) => {
    // const response =  await Participant.findOne({ email }).populate<{ transactions: TransactionType[] }>('transactions');
    const response = await participant_models_1.default.findOne({ email })
        .populate('user')
        .populate('transactions');
    if (!response) {
        throw new errors_types_1.NotFoundError('Participant does not exist');
    }
    return response;
};
const findParticipantById = async (id) => {
    // const response = await Participant.findById(id).populate<{ transactions: TransactionType[] }>('transactions');
    const response = await participant_models_1.default.findById(id)
        .populate('user')
        .populate('transactions');
    if (!response) {
        throw new errors_types_1.NotFoundError('Participant does not exist');
    }
    return response;
};
const updateParticipantById = async (id, updateData) => {
    // Disallow email updates
    const { email, ...allowedData } = updateData;
    if (email) {
        throw new errors_types_1.ValidationError('Email cannot be updated');
    }
    // const response = await Participant.findByIdAndUpdate(id, allowedData, { new: true }).populate<{ transactions: TransactionType[] }>('transactions');
    const response = await participant_models_1.default.findByIdAndUpdate(id, allowedData, { new: true });
    if (!response) {
        throw new errors_types_1.NotFoundError('Participant not found');
    }
    return response;
};
const deleteParticipantById = async (id) => {
    const response = await participant_models_1.default.findByIdAndDelete(id);
    if (!response) {
        throw new errors_types_1.NotFoundError('Participant not found');
    }
    return response;
};
const addTransactionToParticipant = async (participantId, transactionId) => {
    const response = await participant_models_1.default.findByIdAndUpdate(participantId, { $push: { transactions: transactionId } }, { new: true }).populate('transactions');
    if (!response) {
        throw new errors_types_1.NotFoundError('Participant not found');
    }
    return response;
};
const deleteOldGuestParticipants = async (days = 5) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const filter = {
        email: { $regex: /^guest-/ }, // only guest-* emails
        updatedAt: { $lt: cutoff }, // older than N days
        $or: [
            { user: { $exists: false } }, // no user field
            { user: null }, // explicit null
            // user === '' but only when it's actually stored as a string
            {
                // For each document, compare the field $user with the literal "". If they are equal, it matches. Αυτο προστέθηκε γιατι αρχικά το front μου έφτιαχνε τον guest participant με user: '' και οχι null
                $expr: {
                    $and: [
                        { $eq: [{ $type: '$user' }, 'string'] },
                        { $eq: ['$user', ''] }
                    ]
                }
            }
        ]
    };
    // Use the native driver (no Mongoose casting on ObjectId fields)
    const result = await participant_models_1.default.collection.deleteMany(filter);
    return result.deletedCount ?? 0;
};
exports.deleteOldGuestParticipants = deleteOldGuestParticipants;
exports.participantDao = {
    createParticipant,
    findAllParticipants,
    findParticipantByEmail,
    findParticipantById,
    updateParticipantById,
    deleteParticipantById,
    addTransactionToParticipant,
    deleteOldGuestParticipants: exports.deleteOldGuestParticipants,
};
//# sourceMappingURL=participant.dao.js.map