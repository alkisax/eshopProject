// backend\src\stripe\models\participant.models.ts
import mongoose from 'mongoose';
import type { ParticipantType } from '../types/stripe.types';

const Schema = mongoose.Schema;
const participantSchema = new Schema({
  name:{
    type: String,
    required: false
  },
  surname:{
    type: String,
    required: false
  },
  email:{
    type: String,
    required: [true, 'email is required'],
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // 🔹 link to existing User schema
    required: false
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId, // Each item here is an ObjectId pointing to a Transaction document
    ref: 'Transaction' // This tells Mongoose *which* collection/model to link (the 'Transaction' model)
  }],
},
{
  collection: 'participants',
  timestamps: true
});

export default mongoose.model<ParticipantType>('Participant', participantSchema);