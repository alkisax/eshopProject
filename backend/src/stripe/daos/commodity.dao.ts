import Commodity from '../models/commodity.models';
import mongoose from 'mongoose';
import type { CommodityType, CommentType } from '../types/stripe.types';
import { NotFoundError, ValidationError, DatabaseError } from '../../utils/error/errors.types';
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
  const commodity = await Commodity.findById(id)
    .populate('comments.user', 'username');
  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  }
  return commodity;
};

const findCommodityByStripePriceId = async (
  stripePriceId: string
): Promise<CommodityType | null> => {
  return await Commodity.findOne({ stripePriceId });
};

const getAllCategories = async (): Promise<string[]> => {
  const categories = await Commodity.aggregate([
    { $unwind: '$category' },          // flatten arrays
    { $match: { category: { $ne: '' } } }, // skip empty
    { $group: { _id: '$category' } },  // unique
    { $sort: { _id: 1 } }              // sort alphabetically
  ]);
  return categories.map(c => c._id);
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

// εδω έγιναν αλλαγές για να γίνει μέρος του session που έρχετε απο το backend\src\stripe\daos\transaction.dao.ts createTransaction εκεί είναι και τα σχόλια για το session
const sellCommodityById = async (
  id: string | Types.ObjectId,
  quantity: number,
  session?: mongoose.ClientSession   //session
): Promise<CommodityType> => {
  if (quantity <= 0) {
    throw new ValidationError('Quantity must be at least 1');
  }

  const commodity = await Commodity.findById(id).session(session || null); // session;
  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  }

  if (commodity.stock < quantity) {
    throw new ValidationError('Not enough quantity in stock');
  }

  const updated = await Commodity.findByIdAndUpdate(
    id,                        // 1️⃣ Which document? → Match by _id
    {                          // 2️⃣ What update to apply?
      $inc: {                  // Use MongoDB's $inc operator = "increment"
        soldCount: quantity,   // Increase soldCount by the quantity sold
        stock: -quantity       // Decrease stock by the same quantity
      }
    },
    {                          // 3️⃣ Options for Mongoose
      new: true,               // Return the *updated* document (not the old one)
      runValidators: true,
      session //session
    }
  );

  if (!updated) {
    throw new NotFoundError('Commodity not found');
  }

  return updated;
};

// προστέθηκε όταν βάλαμε την λειτουργία να κανει update με excel. το κάνει ελέγχοντας ποια εμπορεύματα έχουν stripe id και ποια όχι, οπότε δημιουργεί όσα δεν έχουν το stripe id που έρχετε απο το excel και κάνει update τα άλλα. για αυτό χρειαζόμασταν ένα dao που να κάνει update με βάση το stripeId
const updateCommodityByStripePriceId = async (
  stripePriceId: string,
  updateData: Partial<CommodityType>
): Promise<CommodityType | null> => {
  try {
    const updated = await Commodity.findOneAndUpdate(
      { stripePriceId },
      updateData,
      { new: true, runValidators: true }
    );

    return updated;

  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw err;
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

const updateCommentInCommodity = async (
  commodityId: string | Types.ObjectId,
  commentId: string | Types.ObjectId,
  updates: Partial<CommentType>
): Promise<CommodityType> => {
  const updated = await Commodity.findOneAndUpdate(
    { _id: commodityId, 'comments._id': commentId },
    { $set: { 'comments.$.isApproved': updates.isApproved } }, // 👈 only update that field
    { new: true }
  );

  if (!updated) {
    throw new NotFoundError('Commodity or Comment not found');
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

const deleteCommentFromCommoditybyCommentId = async (
  commodityId: string | Types.ObjectId,
  commentId: string | Types.ObjectId
): Promise<CommodityType> => {
  const updated = await Commodity.findByIdAndUpdate(
    commodityId,
    { $pull: { comments: { _id: commentId } } },
    { new: true }
  );

  if (!updated) {
    throw new NotFoundError('Commodity or Comment not found');
  }

  return updated;
};

// ⏳ cron autodelete dao action
export const deleteOldUnapprovedComments = async (days = 5): Promise<number> => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  // ✅ ensure same subdocument matches both conditions
  const commodities = await Commodity.find({
    comments: { $elemMatch: { isApproved: false, updatedAt: { $lt: cutoff } } }
  });

  let removedCount = 0;

  for (const commodity of commodities) {
    const before = commodity.comments?.length ?? 0;

    if (!commodity.comments || commodity.comments.length === 0) {
      continue;
    };

    commodity.comments = commodity.comments.filter(
      (c: CommentType) => !(c.isApproved === false && c.updatedAt && c.updatedAt < cutoff)
    );

    const after = commodity.comments.length;
    removedCount += before - after;

    if (before !== after) {
      await commodity.save();
    }
  }

  return removedCount;
};

// chatgpt for hard mongo syntax 😢
const getAllComments = async () => {
  const result = await Commodity.aggregate([
    { $unwind: '$comments' },
    {
      $lookup: {
        from: 'users',                // collection name in Mongo
        localField: 'comments.user',  // ObjectId reference
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        commodity: { _id: '$_id', name: '$name' },
        user: {
          _id: '$userInfo._id',
          username: '$userInfo.username',
          email: '$userInfo.email',
          name: '$userInfo.name'
        },
        text: '$comments.text',
        rating: '$comments.rating',
        isApproved: '$comments.isApproved',
        createdAt: '$comments.createdAt',
        commentId: '$comments._id'
      }
    }
  ]);
  return result;
};

const getCommentsByUser = async (userId: string | Types.ObjectId) => {
  const result = await Commodity.aggregate([
    { $unwind: '$comments' },
    { $match: { 'comments.user': new mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        commodityId: '$_id',
        commodityName: '$name',
        text: '$comments.text',
        rating: '$comments.rating',
        isApproved: '$comments.isApproved',
        createdAt: '$comments.createdAt',
        commentId: '$comments._id'
      }
    }
  ]);
  return result;
};

const deleteAllCommentsByUser = async (userId: string | Types.ObjectId) => {
  const result = await Commodity.updateMany(
    {},
    { $pull: { comments: { user: userId } } }
  );
  return result.modifiedCount;
};

export const commodityDAO = {
  createCommodity,
  findAllCommodities,
  findCommodityById,
  findCommodityByStripePriceId,
  getAllCategories,
  updateCommodityById,
  sellCommodityById,
  updateCommodityByStripePriceId,
  deleteCommodityById,
  addCommentToCommodity,
  updateCommentInCommodity,
  clearCommentsFromCommodity,
  deleteCommentFromCommoditybyCommentId,
  deleteOldUnapprovedComments,
  getAllComments,
  getCommentsByUser,
  deleteAllCommentsByUser
};
