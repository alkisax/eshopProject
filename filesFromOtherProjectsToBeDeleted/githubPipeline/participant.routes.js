const express = require('express')
const router = express.Router()
const participantController = require('../controllers/participant.controller')
const { verifyToken, checkRole } = require('../middlewares/verification.middleware');

/**
 * @swagger
 * tags:
 *   name: Participants
 *   description: API for managing participants
 */

/**
 * @swagger
 * /api/participant:
 *   get:
 *     summary: Get all participants (admin only)
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Participant'
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error fetching participants
 */
router.get ('/', verifyToken, checkRole('admin'), participantController.findAll)

/**
 * @swagger
 * /api/participant:
 *   post:
 *     summary: Create a new participant
 *     tags: [Participants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string@whatever.com
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: 507f1f77bcf86cd799439011
 *                   example: 507f1f77bcf86cd799439011
 *                   default: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Participant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 surname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid input or request body
 */

router.post('/', participantController.create)

/**
 * @swagger
 * /api/participant/{id}:
 *   delete:
 *     summary: Delete a participant by ID
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the participant to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Participant not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, checkRole('admin'), participantController.deleteById)

module.exports = router