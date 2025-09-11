import mongoose from 'mongoose';
import type { PostType } from '../types/blog.types';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, 
  content: {
    time: Number,
    // blocks is an array field in the schema. Each element can be any arbitrary JSON object (Mixed in Mongoose means “accept any type without validation”).
    blocks: [mongoose.Schema.Types.Mixed],
    version: String
  },
  subPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubPage',
    required: true
  },
  pinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model<PostType>('Post', postSchema);