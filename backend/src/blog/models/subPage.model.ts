import mongoose from 'mongoose';
import type { SubPageType } from '../types/blog.types';

const subPageSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    default: 'main'
  }
}, { timestamps: true });

export default mongoose.model<SubPageType>('SubPage', subPageSchema);