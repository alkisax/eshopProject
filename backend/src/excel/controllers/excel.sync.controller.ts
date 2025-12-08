// backend\src\excel\controllers\excel.sync.controller.ts

import type { Request, Response } from 'express';
import path from 'path';
import Commodity from '../../stripe/models/commodity.models';

import { downloadExcelFromAppwrite } from '../utils/downloadExcelFromAppwrite'; // επιστρέφει το excel ως buffer
import { downloadZipFromAppwrite } from '../utils/downloadZipFromAppwrite'; // input: appwrite fileId, out: buffer του zip

import { parseExcelBuffer } from '../excelParcer'; // in:excel buffer, out: πίνακα από "καθαρά" προϊόντα
import { analyzeImagesInput } from '../utils/analyzeImagesInput'; // in: γραμμη του excel out: obj με report για το αν οι εικόνες είναι url, filename η mixed
import { unzipImages } from '../utils/unzipImages'; // in: buffer εικονών out: obj με key-το όνομα του αρχείου και value-το buffer της εικόνας
import { processImagesForProducts } from '../utils/processImagesForProducts'; // in: τα products → κάνει μια for σε κάθε product → κάνει μια δέυτερη for σε κάθε imageName of product.images → αν είναι url το κράτάει → αν είναι filename την παίρνει απο το zip και την ανεβάζει appwrite, out: επιστρέφει τα Products αλλαγμένα
import { handleControllerError } from '../../utils/error/errorHandler';

// import { slugify } from '../../utils/slugify';
import { commodityDAO } from '../../stripe/daos/commodity.dao';

export const syncProductsFromExcel = async (req: Request, res: Response) => {
  try {
    const { fileId, originalName, zipFileId } = req.body;

    if (!fileId || !originalName) {
      return res.status(400).json({
        status: false,
        message: 'Missing fileId or originalName',
      });
    }

    // Validate extension
    const ext = path.extname(originalName).toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) {
      return res.status(400).json({
        status: false,
        message: 'Only Excel files allowed',
      });
    }

    // 1️⃣ Download Excel
    const excelBuffer = await downloadExcelFromAppwrite(fileId);

    // 2️⃣ Parse → rows
    let rows = parseExcelBuffer(excelBuffer);

    // 3️⃣ Analyze images
    const analysis = rows.map((p) => analyzeImagesInput(p));

    const zipNeeded = analysis.some(
      (a) => a.type === 'filenames' || a.type === 'mixed'
    );

    let zipImages: Record<string, Buffer> = {};
    const warnings: string[] = [];

    if (zipNeeded) {
      if (!zipFileId) {
        warnings.push(
          'ZIP missing: filenames found. Keeping previous images for affected products.'
        );
      } else {
        const zipBuffer = await downloadZipFromAppwrite(zipFileId);
        zipImages = await unzipImages(zipBuffer);
        rows = await processImagesForProducts(rows, zipImages);
      }
    }

    // 4️⃣ Collect UUIDs from Excel τα βάζουμε μέσα σε ένα set
    const excelUUIDs = new Set(
      rows
        .filter((product) => product.uuid)
        .map((product) => product.uuid as string)
    );

    // 5️⃣ Results container
    const results = {
      checked: 0,
      created: 0,
      updated: 0,
      deactivated: 0,
      warnings,
      errors: [] as string[],
    };

    // 6️⃣ SYNC each row
    for (const product of rows) {
      try {
        let existing = null;

        if (product.uuid) {
          existing = await commodityDAO.findCommodityByUUID(product.uuid);
        }

        if (!existing) {
          results.checked++;
          await commodityDAO.createCommodity({
            ...product,
            uuid: product.uuid?.trim(),
          });
          results.created++;
          continue;
        }

        results.checked++;

        // UPDATE allowed fields
        const updateData: Partial<typeof product> = {
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          active: product.active,
          stripePriceId: product.stripePriceId,
          images: product.images,
        };

        // 🧠 CHECK IF ANYTHING CHANGED
        const hasChanged =
          existing.name !== updateData.name ||
          existing.description !== updateData.description ||
          JSON.stringify(existing.category) !==
            JSON.stringify(updateData.category) ||
          existing.price !== updateData.price ||
          existing.stock !== updateData.stock ||
          existing.active !== updateData.active ||
          existing.stripePriceId !== updateData.stripePriceId ||
          JSON.stringify(existing.images) !== JSON.stringify(updateData.images);

        // 👉 If nothing changed → skip update
        if (!hasChanged) {
          continue;
        }

        results.updated++;

        // 🟢 APPLY UPDATE
        await commodityDAO.updateCommodityByUUID(existing.uuid!, updateData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(message);
      }
    }

    // 7️⃣ Deactivate DB products not present in Excel
    // lean() κάνει τα αποτελέσματα "σκέτα objects", όχι mongoose documents.
    const allDBProducts = await Commodity.find({}).lean();

    for (const p of allDBProducts) {
      if (!excelUUIDs.has(p.uuid!)) {
        await Commodity.updateOne({ uuid: p.uuid }, { active: false });
        results.deactivated++;
      }
    }

    return res.status(200).json({
      status: true,
      message: 'Excel sync completed',
      data: results,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
