// backend\src\excel\routes\excel.routes.ts
import { Router } from 'express';
import { importProductsFromExcel } from '../controllers/excel.import.controller';
import { exportProductsToExcel } from '../controllers/excel.export.controller';

const router = Router();

// POST /excel/import
router.post('/import', importProductsFromExcel);

// GET /excel/export
router.get('/export', exportProductsToExcel);

export default router;

// Frontend → Appwrite storage.createFile → excel/import (POST) → downloadExcelFromAppwrite() → parseExcelBuffer() → addProductsFromExcel() → JSON response