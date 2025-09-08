"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartController = void 0;
const cart_dao_1 = require("../daos/cart.dao");
const errorHnadler_1 = require("../../utils/errorHnadler");
// GET cart
const getCart = async (req, res) => {
    const participantId = req.params.participantId;
    try {
        const cart = await cart_dao_1.cartDAO.getCartByParticipant(participantId);
        return res.status(200).json({ status: true, data: cart });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// get all carts
const getAllCarts = async (_req, res) => {
    try {
        const cart = await cart_dao_1.cartDAO.getAllCarts();
        return res.status(200).json({ status: true, data: cart });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// POST create empty cart
const createCart = async (req, res) => {
    const participantId = req.body.participantId;
    try {
        const cart = await cart_dao_1.cartDAO.createCart(participantId);
        return res.status(201).json({ status: true, data: cart });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// PATCH add/remove item (increment/decrement)
const addOrRemoveItem = async (req, res) => {
    const { participantId } = req.params;
    const { commodityId, quantity } = req.body;
    try {
        const cart = await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, quantity);
        return res.status(200).json({ status: true, data: cart });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// PATCH update quantity directly
const updateQuantity = async (req, res) => {
    const { participantId } = req.params;
    const { commodityId, quantity } = req.body;
    try {
        const cart = await cart_dao_1.cartDAO.updateItemQuantity(participantId, commodityId, quantity);
        return res.status(200).json({ status: true, data: cart });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// DELETE clear cart
const clearCart = async (req, res) => {
    const { participantId } = req.params;
    try {
        const cart = await cart_dao_1.cartDAO.clearCart(participantId);
        return res.status(200).json({ status: true, data: cart });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// clear old carts (<5days)
const deleteOldCarts = async (_req, res) => {
    try {
        const deletedCount = await cart_dao_1.cartDAO.deleteOldCarts(5);
        res.status(200).json({ status: true, message: `${deletedCount} carts older than 5 days were deleted.` });
    }
    catch (error) {
        (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.cartController = {
    getCart,
    getAllCarts,
    createCart,
    addOrRemoveItem,
    updateQuantity,
    clearCart,
    deleteOldCarts
};
//# sourceMappingURL=cart.controller.js.map