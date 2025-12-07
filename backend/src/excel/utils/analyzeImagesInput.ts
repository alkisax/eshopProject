/* eslint-disable no-console */
// backend\src\excel\utils\analyzeImagesInput.ts
// 3a - Utility που αναλύει ΕΝΑ προϊόν από το Excel και αποφασίζει τι τύπο images έχει (urls, filenames, empty, mixed)
// παίρνει ένα product (ένα excel row) → παίρνει τα images του → κάνει μια for σε κάθε image και ελεγχει αν είναι filename ή url ή λαθος → χαρακτηρίζει το product ως empty url filename ή mixed

import type { CommodityExcelRow } from '../excelParcer';

// Helpers
const isUrl = (v: string) => /^https?:\/\//i.test(v); //regex ξεκινάει με https//;
const isFilename = (v: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(v); //regex, έχει κατάληξη εικόνας;

export interface ImageAnalysisResult {
  type: 'urls' | 'filenames' | 'empty' | 'mixed';
  images: string[];
  hasWrongNames: boolean;
}

export const analyzeImagesInput = (
  product: CommodityExcelRow
): ImageAnalysisResult => {

  // ενα array μετα sting των Images απο excel
  const images = product.images;

  if (!images || images.length === 0) {
    return { type: 'empty', images: [], hasWrongNames: false };
  }

  let urlCount = 0;
  let filenameCount = 0;
  let wrongCount = 0;

  for (const img of images) {
    if (isUrl(img)) {
      urlCount++;
    } else if (isFilename(img)) {
      filenameCount++;
    } else {
      // Ούτε URL ούτε filename
      // ΤΟ ΠΕΤΑΜΕ από την λίστα
      console.warn(`⚠️ Excel: invalid image entry ignored: '${img}'`);
      wrongCount++;
    }
  }

  const hasWrongNames = wrongCount > 0;

  // Αν δεν βγήκε κάτι έγκυρο
  if (urlCount === 0 && filenameCount === 0) {
    return { type: 'empty', images: [], hasWrongNames };
  }

  // ΜΟΝΟ URLs
  if (urlCount > 0 && filenameCount === 0) {
    return { type: 'urls', images, hasWrongNames };
  }

  // ΜΟΝΟ filenames
  if (filenameCount > 0 && urlCount === 0) {
    return { type: 'filenames', images, hasWrongNames };
  }

  // Μικτό
  return { type: 'mixed', images, hasWrongNames };
};
