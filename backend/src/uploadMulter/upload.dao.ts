import Upload from './upload.model';
import type { IUpload, IUploadLean } from './upload.types';
import { Types } from 'mongoose';

// find all, exclude file.data (heavy buffer)
const getAllUploads = async (): Promise<IUploadLean[]> => {
  // 'file.data': 0 means exclude the file.data field (because that’s a potentially huge Buffer with raw binary)
  // .lean() This makes Mongoose return plain JS objects instead of heavy docs:
  // .exec() turns it into a real Promise (Promise<IUpload[]>) which is much safer
  const items = await Upload.find({}, { 'file.data': 0 }).lean().exec();

  const returnedItemsWithUrls =  items.map((i) => ({
    _id: (i._id as Types.ObjectId).toString(),
    name: i.name,
    desc: i.desc,
    file: {
      contentType: i.file.contentType,
      originalName: i.file.originalName,
      filename: i.file.filename,
      size: i.file.size,
      extension: i.file.extension,
      url: `${process.env.BACKEND_URL}/uploads/${i.file.filename}`,
    },
  }));

  return returnedItemsWithUrls;
};

const createUpload = async (imageData: Partial<IUpload>): Promise<IUpload> => {
  return Upload.create(imageData);
};

const deleteUpload = async (uploadId: string): Promise<IUpload | null> => {
  return Upload.findByIdAndDelete(uploadId).exec();
};

export default {
  getAllUploads,
  createUpload,
  deleteUpload,
};