import Commodity from '../stripe/models/commodity.models';
import type { CommodityType } from '../stripe/types/stripe.types';


export const findAllWithVectors = async (): Promise<CommodityType[]> => {
  return await Commodity.find(
    { vector: { $exists: true, $ne: [] } }, // only docs with non-empty vectors
    { name: 1, description: 1, price: 1, currency: 1, images: 1, vector: 1 } // project fields we actually need
  ).lean<CommodityType[]>(); // lean → plain JS objects, faster for read-only
};

// export const findVectorById = async (id: string): Promise<number[] | null> => {
//   const result = await Commodity.findById(id, { vector: 1 }).lean();
//   return result?.vector || null;
// };

// export const updateVectorById = async (id: string, vector: number[]): Promise<void> => {
//   await Commodity.findByIdAndUpdate(id, { vector });
// };
