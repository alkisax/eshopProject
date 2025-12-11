// backend\src\stripe\routes\stripe.routes.ts
import express from 'express';
const router = express.Router();
import { stripeController } from '../controllers/stripe.controller';

router.post('/checkout/cart', stripeController.createCheckoutSession);
router.get('/cancel', stripeController.handleCancel);

// router.get('/success', stripeController.handleSuccess);
// είναι commeted out γιατί έπειδή είναι raw έχει μεταφερθεί στο app.ts
// router.post( '/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

export default router;