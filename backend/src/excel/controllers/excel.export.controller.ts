/* eslint-disable no-console */
// backend\src\excel\controllers\excel.export.controller.ts
import type { Request, Response } from 'express';
import XLSX from 'xlsx';
import Commodity from '../../stripe/models/commodity.models';

export const exportProductsToExcel = async (_req: Request, res: Response) => {
  try {
    // 1️⃣ Fetch all products
    const products = await Commodity.find({}).lean(); // TODO: replace with DAO if needed

    // 2️⃣ Transform DB → Excel rows
    const rows = products.map((p) => ({
      uuid: p.uuid ?? '',
      slug: p.slug ?? '',
      name: p.name,
      description: p.description,
      category: Array.isArray(p.category) ? p.category.join(', ') : '',
      price: p.price,
      stock: p.stock,
      active: p.active,
      stripePriceId: p.stripePriceId,
      images: Array.isArray(p.images) ? p.images.join(', ') : '',

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
