import axios from 'axios';
import { commodityDAO } from '../stripe/daos/commodity.dao';
import type { CommodityType } from '../stripe/types/stripe.types';

export const generateEmbeddingForOneCommodity  = async (
  id: string,
): Promise<CommodityType> => {
  // 1. Load commodity
  const commodity = await commodityDAO.findCommodityById(id);
  // 2. Build text input
  const text = `${commodity.name}. ${commodity.description || ''}`;
  // 3. Generate embedding
  const vector = await getEmbedding(text);
  // 4. Update commodity with vector
  const updated = await commodityDAO.updateCommodityById(commodity._id, { vector });
  return updated;
};

export const getEmbedding = async (
  text: string,
): Promise<number[]> => {
  const apiKey = process.env.OPENAI_API_KEY!;
  const url = 'https://api.openai.com/v1/embeddings';

  try {
    const response = await axios.post(
      url,
      {
        model: 'text-embedding-3-small', // "text-embedding-3-large"
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data[0].embedding; // array of floats
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error fetching embedding: ${error.message}`);
    }
    throw new Error('Error fetching embedding: Unknown error');
  }
};
