import mongoose from 'mongoose';
import { IUpload } from './upload.types';
declare const Upload: mongoose.Model<IUpload, {}, {}, {}, mongoose.Document<unknown, {}, IUpload, {}, {}> & IUpload & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default Upload;
