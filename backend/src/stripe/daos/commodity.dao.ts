import Commodity from '../models/commodity.models';
import type { CommodityType, CommentType } from '../types/stripe.types';
import { NotFoundError, ValidationError, DatabaseError } from '../types/errors.types';
import { Types } from 'mongoose';

// Create
const createCommodity = async (data: Partial<CommodityType>): Promise<CommodityType> => {
  try {
    const existing = await Commodity.findOne({ stripePriceId: data.stripePriceId });
    if (existing) {
      throw new ValidationError('Commodity with this stripePriceId already exists');
    }

    const commodity = new Commodity(data);
    const result = await commodity.save();
    return result;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('Unexpected error creating commodity');
  }
};

// Read all
const findAllCommodities = async (page = 0): Promise<CommodityType[]> => {
  return await Commodity.find().limit(50).skip(page * 50);
};

// Read by ID
const findCommodityById = async (id: string | Types.ObjectId): Promise<CommodityType> => {
  const commodity = await Commodity.findById(id);
  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  }
  return commodity;
};

// Update
const updateCommodityById = async (
  id: string | Types.ObjectId,
  updateData: Partial<CommodityType>
): Promise<CommodityType> => {
  try {
    const updated = await Commodity.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) {
      throw new NotFoundError('Commodity not found');
    }
    return updated;
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw err; // keep ValidationError
    }
    if (err instanceof NotFoundError) {
      throw err; // keep NotFoundError
    }
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('Unexpected error updating commodity');
  }
};

// Delete
const deleteCommodityById = async (id: string | Types.ObjectId): Promise<CommodityType> => {
  const deleted = await Commodity.findByIdAndDelete(id);
  if (!deleted) {
    throw new NotFoundError('Commodity not found');
  }
  return deleted;
};


// ➕ Add comment
const addCommentToCommodity = async (
  commodityId: string | Types.ObjectId,
  comment: CommentType
): Promise<CommodityType> => {
  const updated = await Commodity.findByIdAndUpdate(
    commodityId,
    { $push: { comments: comment } },
    { new: true }
  );
  if (!updated) {
    throw new NotFoundError('Commodity not found');
  }
  return updated;
};

// ❌ Remove all comments (since comments don’t have IDs in your schema)
const clearCommentsFromCommodity = async (
  commodityId: string | Types.ObjectId
): Promise<CommodityType> => {
  const updated = await Commodity.findByIdAndUpdate(
    commodityId,
    { $set: { comments: [] } },
    { new: true }
  );
  if (!updated) {
    throw new NotFoundError('Commodity not found');
  }
  return updated;
};

export const commodityDAO = {
  createCommodity,
  findAllCommodities,
  findCommodityById,
  updateCommodityById,
  deleteCommodityById,

  addCommentToCommodity,
  clearCommentsFromCommodity
};
