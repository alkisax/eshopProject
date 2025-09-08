"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commodityDAO = void 0;
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const errors_types_1 = require("../types/errors.types");
// Create
const createCommodity = async (data) => {
    try {
        const existing = await commodity_models_1.default.findOne({ stripePriceId: data.stripePriceId });
        if (existing) {
            throw new errors_types_1.ValidationError('Commodity with this stripePriceId already exists');
        }
        const commodity = new commodity_models_1.default(data);
        const result = await commodity.save();
        return result;
    }
    catch (err) {
        if (err instanceof Error && err.name === 'ValidationError') {
            throw new errors_types_1.ValidationError(err.message);
        }
        throw new errors_types_1.DatabaseError('Unexpected error creating commodity');
    }
};
// Read all
const findAllCommodities = async (page = 0) => {
    return await commodity_models_1.default.find().limit(50).skip(page * 50);
};
// Read by ID
const findCommodityById = async (id) => {
    const commodity = await commodity_models_1.default.findById(id);
    if (!commodity) {
        throw new errors_types_1.NotFoundError('Commodity not found');
    }
    return commodity;
};
const getAllCategories = async () => {
    const categories = await commodity_models_1.default.aggregate([
        { $unwind: '$category' }, // flatten arrays
        { $match: { category: { $ne: '' } } }, // skip empty
        { $group: { _id: '$category' } }, // unique
        { $sort: { _id: 1 } } // sort alphabetically
    ]);
    return categories.map(c => c._id);
};
// Update
const updateCommodityById = async (id, updateData) => {
    try {
        const updated = await commodity_models_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updated) {
            throw new errors_types_1.NotFoundError('Commodity not found');
        }
        return updated;
    }
    catch (err) {
        if (err instanceof errors_types_1.ValidationError) {
            throw err; // keep ValidationError
        }
        if (err instanceof errors_types_1.NotFoundError) {
            throw err; // keep NotFoundError
        }
        if (err instanceof Error && err.name === 'ValidationError') {
            throw new errors_types_1.ValidationError(err.message);
        }
        throw new errors_types_1.DatabaseError('Unexpected error updating commodity');
    }
};
// εδω έγιναν αλλαγές για να γίνει μέρος του session που έρχετε απο το backend\src\stripe\daos\transaction.dao.ts createTransaction εκεί είναι και τα σχόλια για το session
const sellCommodityById = async (id, quantity, session //session
) => {
    if (quantity <= 0) {
        throw new errors_types_1.ValidationError('Quantity must be at least 1');
    }
    const commodity = await commodity_models_1.default.findById(id).session(session || null); // session;
    if (!commodity) {
        throw new errors_types_1.NotFoundError('Commodity not found');
    }
    if (commodity.stock < quantity) {
        throw new errors_types_1.ValidationError('Not enough quantity in stock');
    }
    const updated = await commodity_models_1.default.findByIdAndUpdate(id, // 1️⃣ Which document? → Match by _id
    {
        $inc: {
            soldCount: quantity, // Increase soldCount by the quantity sold
            stock: -quantity // Decrease stock by the same quantity
        }
    }, {
        new: true, // Return the *updated* document (not the old one)
        runValidators: true,
        session //session
    });
    if (!updated) {
        throw new errors_types_1.NotFoundError('Commodity not found');
    }
    return updated;
};
// Delete
const deleteCommodityById = async (id) => {
    const deleted = await commodity_models_1.default.findByIdAndDelete(id);
    if (!deleted) {
        throw new errors_types_1.NotFoundError('Commodity not found');
    }
    return deleted;
};
// ➕ Add comment
const addCommentToCommodity = async (commodityId, comment) => {
    const updated = await commodity_models_1.default.findByIdAndUpdate(commodityId, { $push: { comments: comment } }, { new: true });
    if (!updated) {
        throw new errors_types_1.NotFoundError('Commodity not found');
    }
    return updated;
};
// ❌ Remove all comments (since comments don’t have IDs in your schema)
const clearCommentsFromCommodity = async (commodityId) => {
    const updated = await commodity_models_1.default.findByIdAndUpdate(commodityId, { $set: { comments: [] } }, { new: true });
    if (!updated) {
        throw new errors_types_1.NotFoundError('Commodity not found');
    }
    return updated;
};
const deleteCommentFromCommoditybyCommentId = async (commodityId, commentId) => {
    const updated = await commodity_models_1.default.findByIdAndUpdate(commodityId, { $pull: { comments: { _id: commentId } } }, { new: true });
    if (!updated) {
        throw new errors_types_1.NotFoundError('Commodity or Comment not found');
    }
    return updated;
};
exports.commodityDAO = {
    createCommodity,
    findAllCommodities,
    findCommodityById,
    getAllCategories,
    updateCommodityById,
    sellCommodityById,
    deleteCommodityById,
    addCommentToCommodity,
    clearCommentsFromCommodity,
    deleteCommentFromCommoditybyCommentId
};
//# sourceMappingURL=commodity.dao.js.map