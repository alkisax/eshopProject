// TODO add slug to commodity so as to have slug urls

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
  isApproved: {
    type: Boolean,
    default: true
  },
}, {
  _id: true,
  timestamps: true
}); 

const commoditySchema = new Schema({
  name: { 
    type: String,
    required: true 
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: [String],
    default: []
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
  soldCount: {
    type: Number,
    default: 0,
    validate: (value: number) => value >= 0
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot go below 0']
  },
  active: {
    type: Boolean,
    default: true 
  },
  images: [{ type: String }],
  comments: {
    type: [commentSchema],
    default: []
  },   
  vector: {  // θα προσθέσουμε vector embedings για cosine similarity αναζήτηση. Θα είναι vectorised το όνομα και η περιγραφή
    type: [Number], // array of floats (1536 long when populated)
    default: undefined, // stays empty until you generate it
  }
},
{
  timestamps: true,
  collection: 'commodities'
});

export default mongoose.model<CommodityType>('Commodity', commoditySchema);