// backend/src/blog/daos/subPage.dao.ts
import SubPage from '../models/subPage.model';
import type { SubPageType } from '../types/blog.types';
import { DatabaseError, NotFoundError } from '../../error/errors.types';
import { Types } from 'mongoose';

const getAllSubPages = async (): Promise<SubPageType[]> => {
  try {
    return await SubPage.find({}).exec();
  } catch (err) {
    throw new DatabaseError(`Failed to fetch subpages: ${(err as Error).message}`);
  }
};

const createSubPage = async (name: string): Promise<SubPageType> => {
  try {
    return await SubPage.create({ name });
  } catch (err) {
    throw new DatabaseError(`Failed to create subpage: ${(err as Error).message}`);
  }
};

const editSubPage = async (
  subPageId: string | Types.ObjectId,
  updates: Partial<SubPageType>
): Promise<SubPageType> => {
  try {
    const updated = await SubPage.findByIdAndUpdate(subPageId, updates, {
      new: true,
    }).exec();

    if (!updated) {
      throw new NotFoundError('SubPage not found');
    }

    return updated;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new DatabaseError(`Failed to edit subpage: ${(err as Error).message}`);
  }
};

const deleteSubPage = async (subPageId: string | Types.ObjectId): Promise<SubPageType> => {
  try {
    const deleted = await SubPage.findByIdAndDelete(subPageId).exec();
    if (!deleted) {
      throw new NotFoundError('SubPage not found');
    }
    return deleted;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new DatabaseError(`Failed to delete subpage: ${(err as Error).message}`);
  }
};

export const subPageDao = {
  getAllSubPages,
  createSubPage,
  editSubPage,
  deleteSubPage,
};
