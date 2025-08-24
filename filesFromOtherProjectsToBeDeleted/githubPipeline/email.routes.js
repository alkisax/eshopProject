const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

/**
 * @swagger
 * /api/email/{transactionId}:
 *   post:
 *     summary: Send thank-you email for a donation
 *     tags:
 *       - Emails
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: ID of the transaction used to retrieve participant info
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thank-you email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Nodemailer response info
 *       500:
 *         description: Server error while sending the email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.post('/:transactionId', emailController.sendThnxEmail);

module.exports = router;
