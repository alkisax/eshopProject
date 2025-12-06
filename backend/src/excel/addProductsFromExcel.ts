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
      let existing = null;

      // 1️⃣ έλεγχος αν υπάρχει προϊόν
      // 1️⃣ If product has uuid → preferred lookup
      if (p.uuid) {
        existing = await commodityDAO.findCommodityByUUID(p.uuid);
      }

      // 2️⃣ If no uuid or not found → fallback to stripePriceId
      if (!existing && p.stripePriceId) {
        existing = await commodityDAO.findCommodityByStripePriceId(
          p.stripePriceId
        );
      }

      if (!existing) {
        // console.log('👉 Creating commodity:', {
        //   name: p.name,
        //   slug: p.slug,
        //   uuid: p.uuid,
        //   stripePriceId: p.stripePriceId,
        // });  erase log

        // 2️⃣ CREATE — but keep uuid & slug if provided
        await commodityDAO.createCommodity({
          ...p,
          uuid: p.uuid?.trim() || undefined,
          slug: p.slug?.trim() || undefined,
        });
        results.created++;
      } else {
        // 4️⃣ UPDATE EXISTING — update only allowed fields
        // δεν θέλουμε να περάσουμε όλο το product οπως έρχετε απο το excel, για αυτό του αφαιρούμε τα uuid και slug ώστε να μην αλλάζουν
        const { uuid: _uuid, slug: _slug, ...safeUpdate } = p;
        await commodityDAO.updateCommodityByUUID(existing.uuid!, safeUpdate);
        results.updated++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      // const message = err instanceof Error ? err.message : JSON.stringify(err);
      // console.error('❌ CREATE ERROR for', p.name, '→', message); //todo remove

      results.errors.push(`Error for ${p.name}: ${message}`);
    }
  }

  return results;
};
