"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCart = void 0;
const cart_models_1 = __importDefault(require("../models/cart.models"));
const errors_types_1 = require("../types/errors.types");
const fetchCart = async (participantId) => {
    const cart = await cart_models_1.default.findOne({ participant: participantId })
        .populate('items.commodity');
    if (!cart || cart.items.length === 0) {
        throw new errors_types_1.ValidationError('Cart is empty or not found');
    }
    return cart;
};
exports.fetchCart = fetchCart;
//# sourceMappingURL=stripe.dao.js.map