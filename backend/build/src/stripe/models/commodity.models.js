"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: Schema.Types.Mixed,
        required: true
    }, // string OR EditorJsData
    rating: {
        type: Number,
        min: 0, max: 5
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, {
    _id: true
});
const commoditySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: [String],
        default: []
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'eur'
    },
    stripePriceId: {
        type: String,
        required: true,
        unique: true
    },
    soldCount: {
        type: Number,
        default: 0,
        validate: (value) => value >= 0
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot go below 0']
    },
    active: {
        type: Boolean,
        default: true
    },
    images: [{ type: String }],
    comments: {
        type: [commentSchema],
        default: []
    }
}, {
    timestamps: true,
    collection: 'commodities'
});
exports.default = mongoose_1.default.model('Commodity', commoditySchema);
//# sourceMappingURL=commodity.models.js.map