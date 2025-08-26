import mongoose from 'mongoose';
import type { TransactionType } from '../types/stripe.types';

const Schema = mongoose.Schema;
const transactionSchema = new Schema({
  itemId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  amount:{
    type: Number,
    required: [true, 'amount is required'],
  },
  processed:{
    type: Boolean,
    default: false
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId, // This stores a reference (ID) to a Participant document
    ref: 'Participant', // This tells Mongoose to link this field to the 'Participant' model
    required: true
  },
  sessionId: {
    type: String
  }
},
{
  collection: 'Transactions',
  timestamps: true
});

export default mongoose.model<TransactionType>('Transaction', transactionSchema);