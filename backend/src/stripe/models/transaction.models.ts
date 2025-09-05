import mongoose from 'mongoose';
import type { TransactionType } from '../types/stripe.types';

const Schema = mongoose.Schema;

const transactionItemSchema = new Schema({
  commodity: {
    type: Schema.Types.ObjectId, // ε΄δω φυλλάω το id του αντικειμένου
    ref: 'Commodity',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  priceAtPurchase: {
    type: Number,
    required: true
  }
}, { _id: false });

const shippingSchema = new Schema({
  fullName: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  postalCode: String,
  country: String,
  phone: String,
  notes: String,
}, { _id: false });

const transactionSchema = new Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId, // This stores a reference (ID) to a Participant document
    ref: 'Participant', // This tells Mongoose to link this field to the 'Participant' model
    required: true
  },
  items: {
    type: [transactionItemSchema],
    required: true
  },
  // το χρηματικό ποσο ως σύνολο
  amount:{
    type: Number,
    required: [true, 'amount is required'],
  },
  shipping: shippingSchema,
  processed:{
    type: Boolean,
    default: false
  },
  cancelled: {
    type: Boolean,
    default: false
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