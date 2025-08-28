import mongoose from 'mongoose';
import { CartType } from '../types/stripe.types';
// import type { TransactionType } from '../types/stripe.types';

const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  commodity: {
    type: Schema.Types.ObjectId,
    ref: 'Commodity',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
  },
  priceAtPurchase: {
    type: Number,
    required: true
  }
}, { _id: false });

const cartSchema = new Schema({
  participant: {
    type: Schema.Types.ObjectId,
    ref: 'Participant',
    required: true,
    unique: true
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
}, { timestamps: true, collection: 'carts' });

export default mongoose.model<CartType>('Cart', cartSchema);
