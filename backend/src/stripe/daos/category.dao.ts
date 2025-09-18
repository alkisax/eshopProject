import Category from '../models/category.models';
import type { CategoryType } from '../types/stripe.types';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError } from '../../error/errors.types';

const  createCategory = async (data: Partial<CategoryType>): Promise<CategoryType> => {
  if (!data.name || !data.slug) {
    throw new ValidationError('Category name and slug are required');
  }
  const category = new Category(data);
  return await category.save();
};

const getAllCategories = async (): Promise<CategoryType[]> => {
  return await Category.find().populate('parent');
};

const getCategoryById = async (id: string | Types.ObjectId): Promise<CategoryType | null> => {
  return await Category.findById(id).populate('parent');
};

const updateCategory = async (id: string | Types.ObjectId, updates: Partial<CategoryType>): Promise<CategoryType | null> => {
  const updated = await Category.findByIdAndUpdate(id, updates, { new: true }).populate('parent');
  if (!updated) {
    throw new NotFoundError('Category not found');
  }
  return updated;
};

const  deleteCategory = async (id: string | Types.ObjectId): Promise<CategoryType | null> => {
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    throw new NotFoundError('Category not found');
  }
  return deleted;
};

const toggleIsTag = async (id: string | Types.ObjectId): Promise<CategoryType> => {
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  };

  category.isTag = !category.isTag;
  return await category.save();
};

const makeParentOf = async (parentId: string | Types.ObjectId, childId: string | Types.ObjectId): Promise<CategoryType> => {
  const parent = await Category.findById(parentId);
  const child = await Category.findById(childId);

  if (!parent || !child) {
    throw new NotFoundError('Parent or Child category not found');
  };

  // link them
  child.parent = parent._id  as Types.ObjectId;;
  await child.save();

  // also update parent's children array
  if (!parent.children) {
    parent.children = [];
  };
  const childIdObj = child._id as Types.ObjectId;
  if (!parent.children.includes(childIdObj)) {
    parent.children.push(childIdObj);
    await parent.save();
  }

  return child;
};

const removeParent = async (childId: string | Types.ObjectId): Promise<CategoryType> => {
  const child = await Category.findById(childId);
  if (!child) {
    throw new NotFoundError('Child category not found');
  }

  if (child.parent) {
    // also clean parent's children
    await Category.findByIdAndUpdate(
      child.parent,
      { $pull: { children: child._id } }
    );
  }

  child.parent = undefined;
  return await child.save();
};


export const categoriesDao = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleIsTag,
  makeParentOf,
  removeParent,
};