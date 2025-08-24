const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

/**
 * @swagger
 * /api/stripe/checkout/{price_id}:
 *   post:
 *     summary: Create a Stripe Checkout session
 *     tags: [Stripe]
 *     parameters:
 *       - in: path
 *         name: price_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe price ID for the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   surname:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *     responses:
 *       200:
 *         description: Checkout session created
 *       500:
 *         description: Server error
 */
router.post('/checkout/:price_id', stripeController.createCheckoutSession);

/**
 * @swagger
 * /api/stripe/success:
 *   get:
 *     summary: Handle success callback from Stripe
 *     tags: [Stripe]
 *     parameters:
 *       - in: query
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Stripe session ID
 *     responses:
 *       200:
 *         description: Transaction recorded or already exists
 *       400:
 *         description: Missing session ID
 *       500:
 *         description: Error processing transaction
 */
router.get('/success', stripeController.handleSuccess);

/**
 * @swagger
 * /api/stripe/cancel:
 *   get:
 *     summary: Handle canceled payment from Stripe
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Payment canceled
 */
router.get('/cancel', stripeController.handleCancel);

module.exports = router;