// backend\src\excel\controllers\excel.import.controller.ts
// 4. o controller για το import προϊόντων απο excel που ήδη βρίσκετε στο appwrit e+ optional ZIP εικόνων (επίσης πρέπει ήδη να βρίσκετε στο appwrite)
import type { Request, Response } from 'express';
//χρειάζετε για να φτιάχνουμε universal paths
import path from 'path';
import { handleControllerError } from '../../utils/error/errorHandler';
// κατεβάζει το αρχειο απο appwrite επιστρέφει buffer. Xρειάζετε fileId που θα το πάρει απο το front και bucket id που θα είναι στο env
import { downloadExcelFromAppwrite } from '../utils/downloadExcelFromAppwrite';
// κατεβάζει το αρχειο απο appwrite επιστρέφει buffer. Xρειάζετε fileId που θα το πάρει απο το front και bucket id που θα είναι στο env. **είναι ακριβώς ίδιο με το downloadExcelFromAppwrite**
import { downloadZipFromAppwrite } from '../utils/downloadZipFromAppwrite';
// παίρνει buffer επιστρέφει έναν πίνακα από "καθαρά" προϊόντα
import { parseExcelBuffer } from '../excelParcer';
// Utility που αναλύει ΕΝΑ προϊόν από το Excel και αποφασίζει τι τύπο images έχει (urls, filenames, empty, mixed)
// επιστρέφει export interface ImageAnalysisResult { type: 'urls' | 'filenames' | 'empty' | 'mixed'; images: string[]; hasWrongNames: boolean; }
import { analyzeImagesInput } from '../utils/analyzeImagesInput';
// επιστρέφει { {filename: buffer},{},{} }
import { unzipImages } from '../utils/unzipImages';
// 3e. Παίρνει products[] + zipImages{ filename: buffer }
// ανεβάζει τις εικόνες στο Appwrite και επιστρέφει τελικό productsWithUrls[]
import { processImagesForProducts } from '../utils/processImagesForProducts';
// διαχειρίζετε τα dao
import { addProductsFromExcel } from '../addProductsFromExcel';

export const importProductsFromExcel = async (req: Request, res: Response) => {
  try {
    const { fileId, originalName, zipFileId } = req.body;

    if (!fileId || !originalName) {
      return res.status(400).json({
        status: false,
        message: 'Missing fileId or originalName',
      });
    }

    // 1. Validate Excel extension
    const ext = path.extname(originalName).toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) {
      return res.status(400).json({
        status: false,
        message: 'Only Excel files are allowed',
      });
    }

    // 2. Download from Appwrite → Buffer
    const excelBuffer = await downloadExcelFromAppwrite(fileId);

    // 3. Buffer → products[]
    // οχι const
    let products = parseExcelBuffer(excelBuffer);

    // 4. Αναλύουμε ΤΟ ΚΑΘΕ προϊόν ξεχωριστά ως προς τα images
    const analysisResults = products.map((p) => analyzeImagesInput(p));

    // Flag: έστω ΕΝΑ προϊόν χρειάζεται ZIP ;
    const zipNeeded = analysisResults.some(
      (result) => result.type === 'filenames'
    );

    // Εδώ θα μαζεύουμε warnings για το response
    const warnings: string[] = [];

    // 5. Placeholder λογική για mixed / hasWrongNames
    analysisResults.forEach((result, index) => {
      if (result.type === 'mixed') {
        warnings.push(
          `Product '${products[index].name}' has mixed URLs + filenames (NOT supported yet)`
        );
        // Placeholder future logic: skip or fix
      }

      if (result.hasWrongNames) {
        warnings.push(
          `Product '${products[index].name}' has invalid image names that were ignored`
        );
        // Placeholder: μπορεί να γίνει reject product στο μέλλον
      }
    });

    // 6️⃣ Αν ΔΕΝ χρειάζεται ZIP → bypass images processing
    // η addProductsFromExcel είναι util που φτιάξαμε εμείς, στο data θα επιστρέψει ένα obj τύπου   const results = { created: 0, updated: 0, errors: [] as string[] };
    if (!zipNeeded) {
      const saveResult = await addProductsFromExcel(products);
      return res.status(201).json({
        status: true,
        message: 'Products imported successfully (no ZIP required)',
        warnings,
        data: saveResult,
      });
    }

    // 7️⃣ ZIP *είναι* απαραίτητο → αλλά μπορεί να λείπει
    if (zipNeeded && !zipFileId) {
      warnings.push(
        'ZIP file missing but Excel contained filenames → importing WITHOUT images'
      );

      // Remove filenames as they cannot be processed
      // κάνει ένα map και ελέγχει ένα ένα τα προιόντα αν έχουν result filenames και αν ναι κάνουν το πεδίο images κενό [] αλλιώς το αφήνουν
      products = products.map((product, index) => {
        const result = analysisResults[index];
        return result.type === 'filenames'
          ? { ...product, images: [] }
          : product;
      });

      const saveResult = await addProductsFromExcel(products);
      return res.status(201).json({
        status: true,
        message: 'Products imported BUT without images (ZIP missing)',
        warnings,
        data: saveResult,
      });
    }

    // 8. ZIP υπάρχει → το κατεβάζουμε
    const zipBuffer = await downloadZipFromAppwrite(zipFileId);

    // 9. Unzip → παίρνουμε βιβλιοθήκη με filename → buffer
    const zipImages = await unzipImages(zipBuffer);

    // 1️0. Επεξεργασία μόνο των προϊόντων με filenames
    const processedProducts = await processImagesForProducts(
      products,
      zipImages
    );

    // 11. Save to DB
    const saveResult = await addProductsFromExcel(processedProducts);

    return res.status(201).json({
      status: true,
      message: 'Products imported successfully (with ZIP images)',
      warnings,
      data: saveResult,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Excel import error:', error);
    return handleControllerError(res, error);
  }
};
