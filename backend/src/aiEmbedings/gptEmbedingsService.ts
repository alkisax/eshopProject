// backend\src\aiEmbedings\gptEmbedingsService.ts
import axios from 'axios';
import { commodityDAO } from '../stripe/daos/commodity.dao';
import type { CommodityType } from '../stripe/types/stripe.types';
import { findAllWithVectors } from './gptEmbedings.commodity.vector.dao';

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

// αυτό εδώ είναι η εφαρμογή του τύπου cos(θ) = (A · B) / (||A|| * ||B||) που μου δίνει την συνημιτονοειδη ομοιότητα. δηλαδή πόσο διαφορετικά δείχνουν τα δύο διανύσματα. Απλώς το πείρα απο αλλού. Το αποτέλεσμα είναι μια τιμή απο -1 (αντίθετα), ως 0 (άσχετα) και ως 1 (πολύ όμοια) 
export const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
};

export const semanticSearchCommodities = async (query: string, topN = 5) => {
  // 1. μου κάνει vector αυτό που έρχετε απο το search bar χρησιμοποιόντας την παραπάνω συνάρτηση (που καλεί την openAI)
  const queryVector = await getEmbedding(query);

  // 2. φέρνουμε μονο τα εμπορευματα που έχουν γίνει vector
  const commodities = await findAllWithVectors();

  // 3. τους κάνουμε συγγριση
  const ranked = commodities
    .map(c => ({
      commodity: c,
      score: cosineSimilarity(queryVector, c.vector!),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, topN);
};