"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const transactionItemSchema = new Schema({
    commodity: {
        type: Schema.Types.ObjectId, // ε΄δω φυλλάω το id του αντικειμένου
        ref: 'Commodity',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    priceAtPurchase: {
        type: Number,
        required: true
    }
}, { _id: false });
const shippingSchema = new Schema({
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    notes: String,
}, { _id: false });
const transactionSchema = new Schema({
    participant: {
        type: mongoose_1.default.Schema.Types.ObjectId, // This stores a reference (ID) to a Participant document
        ref: 'Participant', // This tells Mongoose to link this field to the 'Participant' model
        required: true
    },
    items: {
        type: [transactionItemSchema],
        required: true
    },
    // το χρηματικό ποσο ως σύνολο
    amount: {
        type: Number,
        required: [true, 'amount is required'],
    },
    shipping: shippingSchema,
    processed: {
        type: Boolean,
        default: false
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    sessionId: {
        type: String
    }
}, {
    collection: 'Transactions',
    timestamps: true
});
exports.default = mongoose_1.default.model('Transaction', transactionSchema);
//# sourceMappingURL=transaction.models.js.map