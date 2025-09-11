import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  content: {
    time: Number,
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

module.exports = mongoose.model('Post', postSchema);