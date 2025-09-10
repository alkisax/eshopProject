import { Request, Response } from 'express';
import { categoriesDao } from '../daos/category.dao';
import { handleControllerError } from '../../utils/errorHnadler';

const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoriesDao.createCategory(req.body);
    res.status(201).json({ status: true, data: category });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoriesDao.getAllCategories();
    res.status(200).json({ status: true, data: categories });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoriesDao.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: false, message: 'Category not found' });
    }
    return res.status(200).json({ status: true, data: category });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoriesDao.updateCategory(req.params.id, req.body);
    res.status(200).json({ status: true, data: category });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoriesDao.deleteCategory(req.params.id);
    res.status(200).json({ status: true, data: category });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const toggleIsTag = async (req: Request, res: Response) => {
  try {
    const category = await categoriesDao.toggleIsTag(req.params.id);
    res.status(200).json({ status: true, data: category });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const makeParentOf = async (req: Request, res: Response) => {
  try {
    const { parentId, childId } = req.body;
    const child = await categoriesDao.makeParentOf(parentId, childId);
    res.status(200).json({ status: true, data: child });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const removeParent = async (req: Request, res: Response) => {
  try {
    const child = await categoriesDao.removeParent(req.params.id);
    res.status(200).json({ status: true, data: child });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleIsTag,
  makeParentOf,
  removeParent,
};
