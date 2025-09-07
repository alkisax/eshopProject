import mongoose from 'mongoose';
import type { TransactionType, ParticipantType, CommodityType, ShippingInfoType } from '../types/stripe.types';
import { Types } from 'mongoose';
export declare const transactionDAO: {
    findAllTransactions: () => Promise<TransactionType[]>;
    findTransactionById: (transactionId: string | Types.ObjectId) => Promise<TransactionType & {
        participant: ParticipantType;
    }>;
    createTransaction: (participantId: string | Types.ObjectId, sessionId: string, shipping?: ShippingInfoType) => Promise<TransactionType>;
    deleteTransactionById: (transactionId: string | Types.ObjectId) => Promise<TransactionType>;
    deleteOldProcessedTransactions: (years?: number) => Promise<number>;
    updateTransactionById: (transactionId: string | Types.ObjectId, updateData: Partial<TransactionType>) => Promise<TransactionType>;
    findTransactionsByProcessed: (isProcessed: boolean) => Promise<TransactionType[]>;
    findByParticipantId: (participantId: string | Types.ObjectId) => Promise<(mongoose.Document<unknown, {}, mongoose.MergeType<TransactionType, {
        items: {
            commodity: CommodityType;
        }[];
    }>, {}, {}> & Omit<TransactionType, "items"> & {
        items: {
            commodity: CommodityType;
        }[];
    } & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findBySessionId: (sessionId: string) => Promise<TransactionType | null>;
    addTransactionToParticipant: (participantId: string | Types.ObjectId, transactionId: string | Types.ObjectId) => Promise<ParticipantType>;
};
