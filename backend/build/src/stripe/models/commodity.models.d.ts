import mongoose from 'mongoose';
import type { CommodityType } from '../types/stripe.types';
declare const _default: mongoose.Model<CommodityType, {}, {}, {}, mongoose.Document<unknown, {}, CommodityType, {}, {}> & CommodityType & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
