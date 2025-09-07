"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const participantSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    surname: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User', // 🔹 link to existing User schema
        required: false
    },
    transactions: [{
            type: mongoose_1.default.Schema.Types.ObjectId, // Each item here is an ObjectId pointing to a Transaction document
            ref: 'Transaction' // This tells Mongoose *which* collection/model to link (the 'Transaction' model)
        }],
}, {
    collection: 'participants',
    timestamps: true
});
exports.default = mongoose_1.default.model('Participant', participantSchema);
//# sourceMappingURL=participant.models.js.map