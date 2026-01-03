import { Router } from 'express';
// import { pdfController } from './pdf.controller';
import { createInternalOrderPdf, createShippingInfoPdf, examplePdf } from './pdfkit.controller';
import { middleware } from '../login/middleware/verification.middleware';


const router = Router();

router.get(
  '/internal-order/:transactionId',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  createInternalOrderPdf
);

router.get(
  '/shipping-info/:transactionId',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  createShippingInfoPdf
);

router.get(
  '/example',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  examplePdf
);


export default router;
