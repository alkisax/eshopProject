"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const upload_model_1 = __importDefault(require("./upload.model"));
// find all, exclude file.data (heavy buffer)
const getAllUploads = async () => {
    // 'file.data': 0 means exclude the file.data field (because that’s a potentially huge Buffer with raw binary)
    // .lean() This makes Mongoose return plain JS objects instead of heavy docs:
    // .exec() turns it into a real Promise (Promise<IUpload[]>) which is much safer
    const items = await upload_model_1.default.find({}, { 'file.data': 0 }).lean().exec();
    const returnedItemsWithUrls = items.map((i) => ({
        _id: i._id.toString(),
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
const createUpload = async (imageData) => {
    return upload_model_1.default.create(imageData);
};
const deleteUpload = async (uploadId) => {
    return upload_model_1.default.findByIdAndDelete(uploadId).exec();
};
exports.default = {
    getAllUploads,
    createUpload,
    deleteUpload,
};
//# sourceMappingURL=upload.dao.js.map