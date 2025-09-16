import { subPageDao } from '../daos/subPage.dao';
import type { SubPageType } from '../types/blog.types';
import { handleControllerError } from '../../utils/errorHnadler';
import type { Request, Response } from 'express';

// === CREATE ===
const createSubPage = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as Partial<SubPageType>;

    if (!name) {
      return res.status(400).json({ status: false, message: 'Page name required' });
    }

    const subPage = await subPageDao.createSubPage(name);
    return res.status(201).json({ status: true, data: subPage });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// === GET ALL ===
const getAllSubPages = async (_req: Request, res: Response) => {
  try {
    const subPages = await subPageDao.getAllSubPages();
    return res.status(200).json({ status: true, data: subPages });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// === EDIT ===
const editSubPage = async (req: Request, res: Response) => {
  try {
    const { subPageId } = req.params;
    const { name, description } = req.body as Partial<SubPageType>;

    if (!name) {
      return res.status(400).json({ status: false, message: 'Page name required for edit' });
    }

    // we need to implement edit in DAO
    const updated = await subPageDao.editSubPage(subPageId, { name, description });
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// === DELETE ===
const deleteSubPage = async (req: Request, res: Response) => {
  try {
    const { subPageId } = req.params;
    const deleted = await subPageDao.deleteSubPage(subPageId);
    return res.status(200).json({ status: true, message: 'SubPage deleted successfully', data: deleted });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const subPageController = {
  createSubPage,
  getAllSubPages,
  editSubPage,
  deleteSubPage,
};
