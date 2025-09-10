import mongoose, { Schema } from 'mongoose';
import { CategoryType } from '../types/stripe.types';

const categorySchema = new Schema<CategoryType>({
  name: { 
    type: String,
    required: true,
    unique: true
  },
  slug: { // url friendly
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isTag: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  collection: 'categories'
});

export default mongoose.model<CategoryType>('Category', categorySchema);