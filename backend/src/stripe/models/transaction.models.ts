// backend\src\stripe\models\transaction.models.ts
import mongoose from 'mongoose';
import type { TransactionType } from '../types/stripe.types';

const Schema = mongoose.Schema;

const transactionItemSchema = new Schema(
  {
    commodity: {
      type: Schema.Types.ObjectId, // εδω φυλλάω το id του αντικειμένου
      ref: 'Commodity',
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    quantity: {
      type: Number,
      required: true,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const shippingSchema = new Schema(
  {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    notes: String,
  },
  { _id: false },
);

const transactionSchema = new Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId, // This stores a reference (ID) to a Participant document
      ref: 'Participant', // This tells Mongoose to link this field to the 'Participant' model
      required: true,
    },
    items: {
      type: [transactionItemSchema],
      required: true,
    },
    // το χρηματικό ποσο ως σύνολο
    amount: {
      type: Number,
      required: [true, 'amount is required'],
    },
    shipping: shippingSchema,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped'],
      default: 'pending',
    },
    processed: {
      type: Boolean,
      default: false,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    sessionId: {
      type: String,
    },
    // (αλλαγές για delivery) public token για status polling (αντί για sessionId)
    publicTrackingToken: {
      type: String,
      unique: true,
      sparse: true, // unique (για να το κάνεις lookup χωρίς collisions) αλλά να μην σπάει υπάρχοντα docs
      index: true,
    },
  },
  {
    collection: 'Transactions',
    timestamps: true,
  },
);

export default mongoose.model<TransactionType>(
  'Transaction',
  transactionSchema,
);
