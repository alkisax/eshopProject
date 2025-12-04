// backend\src\excel\routes\excel.routes.ts
import { Router } from 'express';
import { importProductsFromExcel } from '../controllers/excel.import.controller';

const router = Router();

// POST /excel/import
router.post('/import', importProductsFromExcel);

export default router;

// Frontend → Appwrite storage.createFile → excel/import (POST) → downloadExcelFromAppwrite() → parseExcelBuffer() → addProductsFromExcel() → JSON response