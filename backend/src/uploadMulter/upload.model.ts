import mongoose from 'mongoose';
import { IUpload } from './upload.types';

const uploadSchema  = new mongoose.Schema({
  name: String,
  desc: String,
  file: {
    data: Buffer,
    contentType: String,
    originalName: String,
    filename: String,
    size: { type: Number, required: false },
    extension: { type: String, required: false },
  }
});

const Upload = mongoose.model<IUpload>('Upload', uploadSchema);

export default Upload;