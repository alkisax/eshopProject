/* eslint-disable no-console */
import type { Request, Response } from 'express';
import { commodityDAO } from '../daos/commodity.dao';
import { handleControllerError } from '../../utils/errorHnadler';

// POST create commodity
const create = async (req: Request, res: Response) => {
  const data = req.body;

  try {
    const newCommodity = await commodityDAO.createCommodity(data);

    console.log(`Created new commodity: ${newCommodity.name}`);
    return res.status(201).json({ status: true, data: newCommodity });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// GET all commodities
const findAll = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 0;
    const commodities = await commodityDAO.findAllCommodities(page);

    console.log('Fetched all commodities');
    return res.status(200).json({ status: true, data: commodities });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// GET commodity by ID
const findById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: false, error: 'Commodity ID is required' });
  }

  try {
    const commodity = await commodityDAO.findCommodityById(id);
    return res.status(200).json({ status: true, data: commodity });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await commodityDAO.getAllCategories();
    return res.status(200).json({ status: true, data: categories });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// PATCH update commodity
const updateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ status: false, error: 'Commodity ID is required' });
  }

  try {
    const updatedCommodity = await commodityDAO.updateCommodityById(id, updateData);

    console.log(`Updated commodity ${id}`);
    return res.status(200).json({ status: true, data: updatedCommodity });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// PATCH sell commodity (stock decrease + soldCount increase)
const sellById = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const quantity: number  = req.body.quantity;

  if (!id || !quantity) {
    return res.status(400).json({ status: false, message: 'Commodity ID and quantity are required' });
  }

  try {
    const updated = await commodityDAO.sellCommodityById(id, quantity);
    console.log(`Sold ${quantity} of commodity ${id}`);
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// DELETE commodity
const deleteById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: false, message: 'Commodity ID is required' });
  }

  try {
    const deletedCommodity = await commodityDAO.deleteCommodityById(id);

    console.log(`Deleted commodity ${deletedCommodity.name}`);
    return res.status(200).json({ status: true, message: `Commodity ${deletedCommodity.name} deleted successfully` });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getAllComments = async (_req: Request, res: Response) => {
  try {
    const comments = await commodityDAO.getAllComments();
    // console.log('Controller sending:', comments.length);
    res.status(200).json({ status: true, data: comments });
  } catch (err) {
    handleControllerError(res, err);
  }
};

// ➕ Add a comment
const addComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user, text, rating, isApproved } = req.body;

  if (!id) {
    return res.status(400).json({ status: false, error: 'Commodity ID is required' });
  }
  if (!user || !text) {
    return res.status(400).json({ status: false, error: 'Comment requires user and text' });
  }

  try {
    const updated = await commodityDAO.addCommentToCommodity(id, { 
      user, 
      text, 
      rating,
      isApproved: isApproved === false ? false : true 
    });
    console.log(`Added comment to commodity ${id}`);
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateComment = async (req: Request, res: Response) => {
  const { commodityId, commentId } = req.params;
  const { isApproved } = req.body;

  if (!commodityId || !commentId) {
    return res.status(400).json({ status: false, error: 'Commodity ID and Comment ID are required' });
  }

  try {
    const updated = await commodityDAO.updateCommentInCommodity(commodityId, commentId, { isApproved });
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// ❌ Clear all comments
const clearComments = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: false, error: 'Commodity ID is required' });
  }

  try {
    const updated = await commodityDAO.clearCommentsFromCommodity(id);
    console.log(`Cleared comments from commodity ${id}`);
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// ❌ delete only one comment with comment id
const deleteComment = async (req: Request, res: Response) => {
  const { id, commentId } = req.params;

  if (!id || !commentId) {
    return res.status(400).json({ status: false, error: 'Commodity ID and Comment ID are required' });
  }

  try {
    const updated = await commodityDAO.deleteCommentFromCommoditybyCommentId(id, commentId);
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

//⏳❌
const deleteOldUnapprovedComments = async (_req: Request, res: Response) => {
  try {
    const deletedCount = await commodityDAO.deleteOldUnapprovedComments(5); // προεπιλογή 5 μέρες
    res.status(200).json({
      status: true,
      message: `${deletedCount} unapproved comments older than 5 days were deleted.`
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const commodityController = {
  findAll,
  findById,
  create,
  getAllCategories,
  updateById,
  sellById,
  deleteById,
  getAllComments,
  addComment,
  updateComment,
  clearComments,
  deleteComment,
  deleteOldUnapprovedComments
};