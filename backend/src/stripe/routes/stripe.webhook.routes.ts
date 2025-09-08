import express from 'express';
const router = express.Router();
import { stripeController } from '../controllers/stripe.controller';

router.post( '/', express.raw({ type: 'application/json' }), stripeController.handleWebhook);
router.post('', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

export default router;