import mongoose from 'mongoose';
import type { CommodityType } from '../types/stripe.types';

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  text: {
    type: Schema.Types.Mixed,
    required: true
  }, // string OR EditorJsData
  rating: {
    type: Number,
    min: 0, max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
},
{
  _id: false
}); // don’t need separate _id for comments unless you want to edit/delete them individually

const commoditySchema = new Schema({
  name: { 
    type: String,
    required: true 
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'eur'
  },
  stripePriceId: {
    type: String,
    required: true,
    unique: true
  },
  stock: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true 
  },
  images: [{ type: String }],
  comments: {
    type: [commentSchema],
    default: []
  }
},
{
  timestamps: true,
  collection: 'commodities'
});

export default mongoose.model<CommodityType>('Commodity', commoditySchema);