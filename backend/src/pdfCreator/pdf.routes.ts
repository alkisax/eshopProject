import { Router } from 'express';
import { pdfController } from './pdf.controller';
import { middleware } from '../login/middleware/verification.middleware';

console.log('🔥 PDF ROUTES FILE LOADED');

const router = Router();

router.get(
  '/internal-order/:transactionId',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  pdfController.createInternalOrderPdf
);

router.get(
  '/shipping-info/:transactionId',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  pdfController.shippingInfoPdf
);

export default router;
