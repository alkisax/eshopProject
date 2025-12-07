/* eslint-disable no-console */
// backend\src\excel\utils\processImagesForProducts.ts
// 3e. Παίρνει products[] + zipImages{ filename: buffer }
// ανεβάζει τις εικόνες στο Appwrite και επιστρέφει τελικό productsWithUrls[]
// παίρνει τα products → κάνει μια for σε κάθε product → κάνει μια δέυτερη for σε κάθε imageName of product.images → αν είναι url το κράτάει → αν είναι filename την παίρνει απο το zip και την ανεβάζει

import type { CommodityExcelRow } from '../excelParcer'; //⚠️
import { uploadImageBufferToAppwrite } from './uploadImageBufferToAppwrite';

// βαζω εδώ τον τυπο ως comment για να είναι ευαναγνωστο
// interface CommodityExcelRowRaw {
//   uuid: string | null;
//   slug: string | null;
//   name: string | null;
//   description: string | null;
//   category: string | null;
//   price: number | string | null;
//   stock: number | string | null;
//   active: boolean | string | null;
//   stripePriceId: string | null;
//   images: string | null;
// }

// input: array με products & obj βιβλιοθήκη με ονομα εικόνας και buffer εικόνας
// output: updated array products με url αντί για ονοματα αρχείων
export const processImagesForProducts = async (
  products: CommodityExcelRow[],
  zipImages: Record<string, Buffer>
): Promise<CommodityExcelRow[]> => {
  // αρχικοποιηση ενως temporary array που θα βάλουμε ένα ένα τα επεξεργασμένα προιόντα μας (με url αντι fiilename)
  const processedProducts: CommodityExcelRow[] = [];

  for (const product of products) {
    // αρχικοποίηση του πεδίου που θα μπούν τα urls
    const finalImageUrls: string[] = [];

    // product.images = ["keri1.jpg", "keri2.jpg"]
    for (const imageName of product.images) {
      // 1️⃣ Αν είναι URL → το κρατάμε όπως είναι
      if (/^https?:\/\//i.test(imageName)) {
        finalImageUrls.push(imageName);
        continue;
      }

      // 2️⃣ Αλλιώς → είναι filename → το ψάχνουμε στο ZIP
      const buffer = zipImages[imageName];

      if (!buffer) {
        console.warn(`⚠️ Image '${imageName}' not found in ZIP`);
        continue; // Skip this image (do not crash)
      }

      // Upload to Appwrite
      try {
        // χρησιμοποιούμε το util που φτιάξαμε στο 3d βήμα
        const url = await uploadImageBufferToAppwrite(buffer, imageName);
        finalImageUrls.push(url);
      } catch (err) {
        console.error(`❌ Failed to upload image '${imageName}':`, err);
      }
    }

    // Return the product with Appwrite URLs instead of file names
    // κρατάμε όλο το Product όπως είναι εκτός απα το πεδίο images
    processedProducts.push({
      ...product,
      images: finalImageUrls,
    });
  }

  return processedProducts;
};
