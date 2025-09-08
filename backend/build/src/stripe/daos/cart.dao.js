"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartDAO = exports.deleteOldCarts = void 0;
const cart_models_1 = __importDefault(require("../models/cart.models"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const errors_types_1 = require("../types/errors.types");
// 🔹 Get cart for participant
const getCartByParticipant = async (participantId) => {
    const cart = await cart_models_1.default.findOne({ participant: participantId }).populate('items.commodity');
    if (!cart) {
        return createCart(participantId);
    }
    return cart;
};
const getAllCarts = async () => {
    const carts = await cart_models_1.default.find({}).populate('items.commodity');
    return carts;
};
// 🔹 Create a new empty cart for participant
const createCart = async (participantId) => {
    try {
        const existing = await cart_models_1.default.findOne({ participant: participantId });
        if (existing) {
            throw new errors_types_1.ValidationError('Cart already exists for this participant');
        }
        const cart = new cart_models_1.default({ participant: participantId, items: [] });
        return await cart.save();
    }
    catch (err) {
        if (err instanceof errors_types_1.ValidationError) {
            throw new errors_types_1.ValidationError('Cart already exists for this participant');
        }
        throw new errors_types_1.DatabaseError('Error creating cart');
    }
};
const addOrRemoveItemToCart = async (participantId, commodityId, quantity) => {
    const cart = await cart_models_1.default.findOne({ participant: participantId });
    if (!cart) {
        throw new errors_types_1.NotFoundError('Cart not found');
    }
    ;
    const commodity = await commodity_models_1.default.findById(commodityId);
    if (!commodity) {
        throw new errors_types_1.NotFoundError('Commodity not found');
    }
    ;
    const existingItem = cart.items.find(item => item.commodity.toString() === commodityId.toString());
    if (existingItem) {
        // ελεγχος αν υπερβένει το στοκ
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > commodity.stock) {
            throw new errors_types_1.ValidationError('Not enough stock available');
        }
        // 🔹 always refresh price to current commodity.price
        existingItem.priceAtPurchase = commodity.price;
        // αλλάζω την ποσότητα προσθέτοντας/αφαιρόντας (το quantity μπορεί να είναι '-')
        existingItem.quantity += quantity;
        //If after updating, the quantity is 0 or negative (e.g. user removed items): Remove the item completely from the cart.
        if (existingItem.quantity <= 0) {
            cart.items = cart.items.filter(item => item.commodity.toString() !== commodityId.toString());
        }
        // Case: The item does not exist  
    }
    else if (quantity > 0) {
        if (quantity > commodity.stock) {
            throw new errors_types_1.ValidationError('Not enough stock available');
        }
        cart.items.push({ commodity: commodityId, quantity, priceAtPurchase: commodity.price });
    }
    return await cart.save();
};
// 🔹 Update quantity of an item
// παρότι η παραπάνω μπορει να κάνει πχ +1 ή -1 εδώ μπορούμε να συμπληρώσουμε κατευθείαν την ποσότητα (να πεις πχ θέλω 7)
const updateItemQuantity = async (participantId, commodityId, quantity) => {
    // φέρνω το cart
    const cart = await cart_models_1.default.findOne({ participant: participantId });
    if (!cart) {
        throw new errors_types_1.NotFoundError('Cart not found');
    }
    // φέρνω το προς αλλαγή αντικείμενο του cart
    const item = cart.items.find(item => item.commodity.toString() === commodityId.toString());
    if (!item) {
        throw new errors_types_1.NotFoundError('Item not in cart');
    }
    if (quantity <= 0) {
        // αν η ποσότητα γίνει 0 το αφαιρω
        cart.items = cart.items.filter(i => i.commodity.toString() !== commodityId.toString());
    }
    else {
        const commodity = await commodity_models_1.default.findById(commodityId);
        if (!commodity) {
            throw new errors_types_1.NotFoundError('Commodity not found');
        }
        ;
        if (quantity > commodity.stock) {
            throw new errors_types_1.ValidationError('Not enough stock available');
        }
        ;
        item.quantity = quantity;
        // refresh price
        item.priceAtPurchase = commodity.price;
    }
    return await cart.save();
};
// 🔹 Clear cart
const clearCart = async (participantId) => {
    const cart = await cart_models_1.default.findOneAndUpdate({ participant: participantId }, { $set: { items: [] } }, { new: true });
    if (!cart) {
        throw new errors_types_1.NotFoundError('Cart not found');
    }
    return cart;
};
// delete older than 5 days 
const deleteOldCarts = async (days = 5) => {
    // becomes a date obj
    const toBeCLeared = new Date();
    // today - days
    toBeCLeared.setDate(toBeCLeared.getDate() - days);
    // $lt: less than
    const result = await cart_models_1.default.deleteMany({
        updatedAt: { $lt: toBeCLeared },
    });
    return result.deletedCount ?? 0;
};
exports.deleteOldCarts = deleteOldCarts;
exports.cartDAO = {
    getCartByParticipant,
    getAllCarts,
    createCart,
    addOrRemoveItemToCart,
    updateItemQuantity,
    clearCart,
    deleteOldCarts: exports.deleteOldCarts
};
//# sourceMappingURL=cart.dao.js.map