import express from 'express';
const router = express.Router();
import { stripeController } from '../controllers/stripe.controller';

router.post('/checkout/cart', stripeController.createCheckoutSession);
router.get('/cancel', stripeController.handleCancel);

// router.get('/success', stripeController.handleSuccess);
// router.post( '/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

export default router;