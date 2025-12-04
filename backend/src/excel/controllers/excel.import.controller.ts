// backend\src\excel\controllers\excel.import.controller.ts
// 4. o controller για το input απο excel που ήδη βρίσκετε στο appwrite
import type { Request, Response } from 'express';
import path from 'path'; //χρειάζετε για να φτιάχνουμε universal paths
import { handleControllerError } from '../../utils/error/errorHandler';
import { downloadExcelFromAppwrite } from '../utils/downloadExcelFromAppwrite'; // κατεβάζει το αρχειο απο appwrite επιστρέφει buffer. Xρειάζετε fileId που θα το πάρει απο το front και bucket id που θα είναι στο env
import { parseExcelBuffer } from '../excelParcer'; // παίρνει buffer επιστρέφει έναν πίνακα από "καθαρά" προϊόντα
import { addProductsFromExcel } from '../addProductsFromExcel';  // διχειρίζετε τα dao

export const importProductsFromExcel = async (req: Request, res: Response) => {
  try {
    const { fileId, originalName } = req.body;

    if (!fileId || !originalName) {
      return res.status(400).json({
        status: false,
        message: 'Missing fileId or originalName',
      });
    }

    // 1️⃣ Validate Excel extension
    const ext = path.extname(originalName).toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) {
      return res.status(400).json({
        status: false,
        message: 'Only Excel files are allowed',
      });
    }

    // 2️⃣ Download from Appwrite → Buffer
    const buffer = await downloadExcelFromAppwrite(fileId);

    // 3️⃣ Buffer → products[]
    const products = parseExcelBuffer(buffer);

    // 4️⃣ Save products → Mongo
    const result = await addProductsFromExcel(products);

    return res.status(201).json({
      status: true,
      message: 'Products imported successfully',
      data: result,
    });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Excel import error:', error);
    return handleControllerError(res, error);
  }
};
