"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uploadSchema = new mongoose_1.default.Schema({
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
const Upload = mongoose_1.default.model('Upload', uploadSchema);
exports.default = Upload;
//# sourceMappingURL=upload.model.js.map