// backend\src\excel\addProductsFromExcel.ts
// 2. αυτή η βοηθητική συνάρτηση παίρνει όλα τα products, ελέγχει αν υπαρχουν στην βάση δεδομένων με βάση το stripe id και τα δημιουργεί ή τα κάνει update καλόντας τα αντίστοιχα dao ανάλογα
// προσοχή έχει ένα import type απο άσχετο σημείο

import { commodityDAO } from '../stripe/daos/commodity.dao';
import type { CommodityExcelRow } from './excelParcer'; // ⚠️

export const addProductsFromExcel = async (products: CommodityExcelRow[]) => {
  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const p of products) {
    try {
      // 1️⃣ έλεγχος αν υπάρχει προϊόν
      const existing = await commodityDAO.findCommodityByStripePriceId(
        p.stripePriceId
      );

      if (!existing) {
        // 2️⃣ CREATE
        await commodityDAO.createCommodity(p);
        results.created++;
      } else {
        // 3️⃣ UPDATE
        await commodityDAO.updateCommodityByStripePriceId(p.stripePriceId, p);
        results.updated++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      results.errors.push(`Error for ${p.name}: ${message}`);
    }
  }

  return results;
};
