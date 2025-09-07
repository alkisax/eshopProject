import mongoose from 'mongoose';
import type { ParticipantType } from '../types/stripe.types';
declare const _default: mongoose.Model<ParticipantType, {}, {}, {}, mongoose.Document<unknown, {}, ParticipantType, {}, {}> & ParticipantType & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
