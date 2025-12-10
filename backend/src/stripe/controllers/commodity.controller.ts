/* eslint-disable no-console */
import type { Request, Response } from 'express';
import { commodityDAO } from '../daos/commodity.dao';
import { handleControllerError } from '../../utils/error/errorHandler';
import {
  createCommoditySchema,
  updateCommoditySchema,
  createCommentSchema,
  updateCommentSchema,
} from '../validation/commerce.schema';

// POST create commodity
const create = async (req: Request, res: Response) => {
  try {
    const parsed = createCommoditySchema.parse(req.body);
    const data = parsed;

    const newCommodity = await commodityDAO.createCommodity(data);

    console.log(`Created new commodity: ${newCommodity.name}`);
    return res.status(201).json({ status: true, data: newCommodity });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// GET all commodities
const findAll = async (_req: Request, res: Response) => {
  try {
    const commodities = await commodityDAO.findAllCommodities();

    console.log('Fetched all commodities');
    return res.status(200).json({ status: true, data: commodities });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// find all paginated
// in: αρηθμός σελίδας, πόσα products ανα σελίδα. out: products, total, page, pagecount, limit
const findAllPaginated = async (req: Request, res: Response) => {
  try {
    let page: number = 1;
    let limit: number = 10;
    const pageParam = req.query.page;
    const limitParam = req.query.limit;

    if (typeof pageParam === 'string') {
      const parsedPage = Number(pageParam);
      if (!Number.isNaN(parsedPage) && parsedPage > 0) {
        // Για να αποκλείσουμε input που δεν είναι αριθμός.
        page = parsedPage;
      }
    }

    if (typeof limitParam === 'string') {
      const parsedLimit = Number(limitParam);
      if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    const result = await commodityDAO.findAllCommoditiesPaginated(page, limit);

    return res.status(200).json({
      status: true,
      data: result.items,
      total: result.total,
      page: result.page,
      pageCount: result.pageCount,
      limit,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// search με search bar ή/και category(ies) filtering
// in: pagination info (page, limit), query
// out: pagination info, filtered items
const search = async (req: Request, res: Response) => {
  try {
    // pagination params
    let page: number = 1;
    let limit: number = 12;

    const pageParam = req.query.page;
    const limitParam = req.query.limit;

    // απο το query μου έρχονται όλα σε string
    if (typeof pageParam === 'string') {
      const parsed = Number(pageParam);
      if (!Number.isNaN(parsed) && parsed > 0) {
        page = parsed;
      }
    }

    if (typeof limitParam === 'string') {
      const parsed = Number(limitParam);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }

    // --- search param ---
    let search: string | undefined = undefined;
    const searchParam = req.query.search;

    if (typeof searchParam === 'string') {
      const trimmed = searchParam.trim();
      if (trimmed !== '') {
        search = trimmed;
      }
    }

    // --- categories param ---
    let categories: string[] | undefined = undefined;
    const categoriesParam = req.query.categories;

    if (Array.isArray(categoriesParam)) {
      categories = categoriesParam.map((c) => String(c));
    } else if (typeof categoriesParam === 'string') {
      categories = [categoriesParam];
    }

    // --- DAO call ---
    const result = await commodityDAO.searchCommodities({
      page,
      limit,
      search,
      categories,
    });

    // --- response ---
    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// GET commodity by ID
const findById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ status: false, error: 'Commodity ID is required' });
  }

  try {
    const commodity = await commodityDAO.findCommodityById(id);
    return res.status(200).json({ status: true, data: commodity });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const findBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    return res
      .status(400)
      .json({ status: false, error: 'Commodity slug is required' });
  }

  try {
    const commodity = await commodityDAO.findCommodityBySlug(slug);
    if (!commodity) {
      return res
        .status(404)
        .json({ status: false, error: 'Commodity not found' });
    }
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

  if (!id) {
    return res
      .status(400)
      .json({ status: false, error: 'Commodity ID is required' });
  }

  try {
    const parsed = updateCommoditySchema.parse(req.body);
    const updateData = parsed;
    const updatedCommodity = await commodityDAO.updateCommodityById(
      id,
      updateData
    );

    console.log(`Updated commodity ${id}`);
    return res.status(200).json({ status: true, data: updatedCommodity });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// PATCH sell commodity (stock decrease + soldCount increase)
const sellById = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const quantity: number = req.body.quantity;

  if (!id || !quantity) {
    return res.status(400).json({
      status: false,
      message: 'Commodity ID and quantity are required',
    });
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
    return res
      .status(400)
      .json({ status: false, message: 'Commodity ID is required' });
  }

  try {
    const deletedCommodity = await commodityDAO.deleteCommodityById(id);

    console.log(`Deleted commodity ${deletedCommodity.name}`);
    return res.status(200).json({
      status: true,
      message: `Commodity ${deletedCommodity.name} deleted successfully`,
    });
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

  if (!id) {
    return res
      .status(400)
      .json({ status: false, error: 'Commodity ID is required' });
  }

  try {
    const parsed = createCommentSchema.parse(req.body);
    const { user, text, rating, isApproved } = parsed;

    const updated = await commodityDAO.addCommentToCommodity(id, {
      user,
      text,
      rating,
      isApproved: isApproved === false ? false : true,
    });
    console.log(`Added comment to commodity ${id}`);
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateComment = async (req: Request, res: Response) => {
  const { commodityId, commentId } = req.params;

  if (!commodityId || !commentId) {
    return res.status(400).json({
      status: false,
      error: 'Commodity ID and Comment ID are required',
    });
  }

  try {
    const parsed = updateCommentSchema.parse(req.body);
    const { isApproved } = parsed;

    const updated = await commodityDAO.updateCommentInCommodity(
      commodityId,
      commentId,
      { isApproved }
    );
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// ❌ Clear all comments
const clearComments = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ status: false, error: 'Commodity ID is required' });
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
    return res.status(400).json({
      status: false,
      error: 'Commodity ID and Comment ID are required',
    });
  }

  try {
    const updated = await commodityDAO.deleteCommentFromCommoditybyCommentId(
      id,
      commentId
    );
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
      message: `${deletedCount} unapproved comments older than 5 days were deleted.`,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const deleteAllCommentsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const count = await commodityDAO.deleteAllCommentsByUser(userId);
    return res
      .status(200)
      .json({ status: true, message: `${count} comments removed` });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const getCommentsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const comments = await commodityDAO.getCommentsByUser(userId);
    return res.status(200).json({ status: true, data: comments });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const commodityController = {
  findAll,
  findAllPaginated,
  search,
  findById,
  findBySlug,
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
  deleteOldUnapprovedComments,
  deleteAllCommentsByUser,
  getCommentsByUser,
};
