import mongoose from 'mongoose';
import { CartType } from '../types/stripe.types';
declare const _default: mongoose.Model<CartType, {}, {}, {}, mongoose.Document<unknown, {}, CartType, {}, {}> & CartType & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
