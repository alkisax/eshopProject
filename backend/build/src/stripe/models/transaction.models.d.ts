import mongoose from 'mongoose';
import type { TransactionType } from '../types/stripe.types';
declare const _default: mongoose.Model<TransactionType, {}, {}, {}, mongoose.Document<unknown, {}, TransactionType, {}, {}> & TransactionType & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
