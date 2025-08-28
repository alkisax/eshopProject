import express from 'express';
const router = express.Router();
import { stripeController } from '../controllers/stripe.controller';

router.post('/checkout/cart', stripeController.createCheckoutSession);

router.get('/success', stripeController.handleSuccess);

router.get('/cancel', stripeController.handleCancel);

export default router;