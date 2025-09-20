/* eslint-disable no-console */
import { generateEmbeddingForOneCommodity, semanticSearchCommodities } from './gptEmbedingsService';
import type { Request, Response } from 'express';
import { handleControllerError } from '../utils/error/errorHandler';
import { commodityDAO } from '../stripe/daos/commodity.dao';

const vectorizeOneHandler = async (req: Request, res:Response) => {
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
    // αυτα έχουν προστεθεί γιατί το dao που μου έφενε τα commodities είναι paginated
    // const findAllCommodities = async (page = 0): Promise<CommodityType[]> => { return await Commodity.find().limit(50).skip(page * 50); };
    // On page = 0 → skips 0, returns commodities 0–49. On page = 1 → skips 50, returns commodities 50–99.
    let page = 0;
    let updatedCount = 0;

    while (true) {
      const commodities = await commodityDAO.findAllCommodities(page);
      // οταν θα ζητήσουμε απο το commodityDao να φτάσει στην πρωτη σελίδα αδεια θα στείλει [] και θα κάνει trigger το break
      if (commodities.length === 0) {
        break;
      }

      for (const c of commodities) {
        try {
          await generateEmbeddingForOneCommodity(c._id.toString());
          updatedCount++;
        } catch (error) {
          return handleControllerError(res, error);
        }
      }

      page++;
    }

    return res.json({ status: true, data: updatedCount });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const searchHandler = async (req: Request, res: Response) => {
  try {
    const { q } = req.query as { q: string };
    if (!q) {
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
  searchHandler
};