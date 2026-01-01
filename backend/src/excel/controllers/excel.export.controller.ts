/* eslint-disable no-console */
// backend\src\excel\controllers\excel.export.controller.ts
import type { Request, Response } from 'express';
import XLSX from 'xlsx';
import Commodity from '../../stripe/models/commodity.models';

// helper func για την μορφή των variant στο excel
// αν υπάρχουν variants → κάνουμε ένα map σε κάθε variant οπου εννώνουμε key|value ως string καθε σετ με ';'. αν δεν υπάρχουν variants → ''
const formatVariantsForExcel = (
  variants?: {
    attributes?: Record<string, string>;
    active?: boolean;
  }[]
): string => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return '';
  }

  return (
    variants
      // για κάθε variant φτιάχνουμε "key=value|key=value|_active=true ;"
      .map((variant) => {
        const attrs = Object.entries(variant.attributes ?? {}).map(
          ([key, value]) => `${key}=${value}`
        );

        if (attrs.length === 0) {
          return '';
        }

        const active =
          variant.active !== undefined
            ? `_active=${variant.active}`
            : '_active=true';

        return [...attrs, active].join('|');
      })
      // κόβουμε empty variants (π.χ. {})
      .filter((v) => v.length > 0)
      // ενώνουμε variants με ';'
      .join(' ; ')
  );
};

export const exportProductsToExcel = async (_req: Request, res: Response) => {
  try {
    // 1️⃣ Fetch all products
    const products = await Commodity.find({}).lean(); // TODO: replace with DAO

    // 2️⃣ Transform DB → Excel rows
    const rows = products.map((p) => ({
      uuid: p.uuid ?? '',
      slug: p.slug ?? '',
      name: p.name,
      // επειδή μπορεί να έχει πολλά variants με διαφορετικά attributes (πχ size=S|color=red ; size=M|color=blue) δεν αρκεί μια απλή csv μορφή
      variants: formatVariantsForExcel(p.variants),
      description: p.description,
      details: p.details ?? '',
      tips: p.tips ?? '',
      category: Array.isArray(p.category) ? p.category.join(', ') : '',
      price: p.price,
      stock: p.stock,
      active: p.active,
      stripePriceId: p.stripePriceId,
      images: Array.isArray(p.images) ? p.images.join(', ') : '',
      requiresProcessing: p.requiresProcessing ?? false,
      processingTimeDays:
        p.processingTimeDays !== undefined ? p.processingTimeDays : '',

      // Προαιρετικά: useful metadata
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : '',
    }));

    // 3️⃣ Convert rows → Worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // 4️⃣ Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    // 5️⃣ Serialize workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    // 6️⃣ Set headers for download
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="products_export.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // 7️⃣ Send
    return res.send(excelBuffer);
  } catch (error) {
    console.error('Excel export error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to export products to Excel',
    });
  }
};
