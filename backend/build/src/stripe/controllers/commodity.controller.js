"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commodityController = void 0;
const commodity_dao_1 = require("../daos/commodity.dao");
const errorHnadler_1 = require("../../utils/errorHnadler");
// POST create commodity
const create = async (req, res) => {
    const data = req.body;
    try {
        const newCommodity = await commodity_dao_1.commodityDAO.createCommodity(data);
        console.log(`Created new commodity: ${newCommodity.name}`);
        return res.status(201).json({ status: true, data: newCommodity });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// GET all commodities
const findAll = async (req, res) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 0;
        const commodities = await commodity_dao_1.commodityDAO.findAllCommodities(page);
        console.log('Fetched all commodities');
        return res.status(200).json({ status: true, data: commodities });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// GET commodity by ID
const findById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ status: false, error: 'Commodity ID is required' });
    }
    try {
        const commodity = await commodity_dao_1.commodityDAO.findCommodityById(id);
        return res.status(200).json({ status: true, data: commodity });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
const getAllCategories = async (_req, res) => {
    try {
        const categories = await commodity_dao_1.commodityDAO.getAllCategories();
        return res.status(200).json({ status: true, data: categories });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// PATCH update commodity
const updateById = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    if (!id) {
        return res.status(400).json({ status: false, error: 'Commodity ID is required' });
    }
    try {
        const updatedCommodity = await commodity_dao_1.commodityDAO.updateCommodityById(id, updateData);
        console.log(`Updated commodity ${id}`);
        return res.status(200).json({ status: true, data: updatedCommodity });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// PATCH sell commodity (stock decrease + soldCount increase)
const sellById = async (req, res) => {
    const id = req.params.id;
    const quantity = req.body.quantity;
    if (!id || !quantity) {
        return res.status(400).json({ status: false, message: 'Commodity ID and quantity are required' });
    }
    try {
        const updated = await commodity_dao_1.commodityDAO.sellCommodityById(id, quantity);
        console.log(`Sold ${quantity} of commodity ${id}`);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// DELETE commodity
const deleteById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ status: false, message: 'Commodity ID is required' });
    }
    try {
        const deletedCommodity = await commodity_dao_1.commodityDAO.deleteCommodityById(id);
        console.log(`Deleted commodity ${deletedCommodity.name}`);
        return res.status(200).json({ status: true, message: `Commodity ${deletedCommodity.name} deleted successfully` });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// ➕ Add a comment
const addComment = async (req, res) => {
    const { id } = req.params;
    const { user, text, rating } = req.body;
    if (!id) {
        return res.status(400).json({ status: false, error: 'Commodity ID is required' });
    }
    if (!user || !text) {
        return res.status(400).json({ status: false, error: 'Comment requires user and text' });
    }
    try {
        const updated = await commodity_dao_1.commodityDAO.addCommentToCommodity(id, { user, text, rating });
        console.log(`Added comment to commodity ${id}`);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// ❌ Clear all comments
const clearComments = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ status: false, error: 'Commodity ID is required' });
    }
    try {
        const updated = await commodity_dao_1.commodityDAO.clearCommentsFromCommodity(id);
        console.log(`Cleared comments from commodity ${id}`);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// ❌ delete only one comment with comment id
const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    if (!id || !commentId) {
        return res.status(400).json({ status: false, error: 'Commodity ID and Comment ID are required' });
    }
    try {
        const updated = await commodity_dao_1.commodityDAO.deleteCommentFromCommoditybyCommentId(id, commentId);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.commodityController = {
    findAll,
    findById,
    create,
    getAllCategories,
    updateById,
    sellById,
    deleteById,
    addComment,
    clearComments,
    deleteComment
};
//# sourceMappingURL=commodity.controller.js.map