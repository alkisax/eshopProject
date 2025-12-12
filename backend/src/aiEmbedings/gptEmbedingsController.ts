// backend\src\aiEmbedings\gptEmbedingsController.ts
/* eslint-disable no-console */
import {
  generateEmbeddingForOneCommodity,
  semanticSearchCommodities,
} from './gptEmbedingsService';
import type { Request, Response } from 'express';
import { handleControllerError } from '../utils/error/errorHandler';
import { commodityDAO } from '../stripe/daos/commodity.dao';

const vectorizeOneHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await generateEmbeddingForOneCommodity(id);
    console.log('vectorized!');
    return res.json({ status: 'ok', commodity: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const vectorizeAllHandler = async (_req: Request, res: Response) => {
  try {
    const commodities = await commodityDAO.findAllCommodities();

    for (const c of commodities) {
      await generateEmbeddingForOneCommodity(c._id.toString());
    }

    return res.json({ status: true });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const searchHandler = async (req: Request, res: Response) => {
  try {
    const q = req.query.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query' });
    }

    const results = await semanticSearchCommodities(q, 5);
    return res.json({ status: true, data: results });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const gptEmbedingsController = {
  vectorizeOneHandler,
  vectorizeAllHandler,
  searchHandler,
};
