import type { ParticipantType } from '../types/stripe.types';
import { Types } from 'mongoose';
export declare const deleteOldGuestParticipants: (days?: number) => Promise<number>;
export declare const participantDao: {
    createParticipant: (participantData: ParticipantType) => Promise<import("mongoose").Document<unknown, {}, ParticipantType, {}, {}> & ParticipantType & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAllParticipants: (page?: number) => Promise<ParticipantType[]>;
    findParticipantByEmail: (email: string) => Promise<ParticipantType>;
    findParticipantById: (id: string) => Promise<ParticipantType>;
    updateParticipantById: (id: string, updateData: Partial<ParticipantType>) => Promise<ParticipantType>;
    deleteParticipantById: (id: string) => Promise<ParticipantType>;
    addTransactionToParticipant: (participantId: Types.ObjectId, transactionId: Types.ObjectId) => Promise<ParticipantType>;
    deleteOldGuestParticipants: (days?: number) => Promise<number>;
};
