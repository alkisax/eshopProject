"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// import type { TransactionType } from '../types/stripe.types';
const Schema = mongoose_1.default.Schema;
const cartItemSchema = new Schema({
    commodity: {
        type: Schema.Types.ObjectId,
        ref: 'Commodity',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    priceAtPurchase: {
        type: Number,
        required: true
    }
}, { _id: false });
const cartSchema = new Schema({
    participant: {
        type: Schema.Types.ObjectId,
        ref: 'Participant',
        required: true,
        unique: true
    },
    items: {
        type: [cartItemSchema],
        default: []
    },
}, { timestamps: true, collection: 'carts' });
exports.default = mongoose_1.default.model('Cart', cartSchema);
//# sourceMappingURL=cart.models.js.map