"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'username is required'],
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    roles: {
        type: [String],
        default: ['user']
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    hashedPassword: {
        type: String,
        required: [true, 'password is required'],
    }
}, {
    collection: 'users',
    timestamps: true
});
exports.default = module.exports = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=users.models.js.map