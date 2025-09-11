const express = require('express');
const router = express.Router();
const subPageController = require('../controllers/subPage.controller')

/**
 * @swagger
 * /api/subPages:
 *   post:
 *     summary: Create a new Editor.js post
 *     tags: [subPages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *     responses:
 *       200:
 *         description: subPage created
 *       500:
 *         description: Server error
 */
router.post('/', subPageController.createSubPage)

/**
 * @swagger
 * /api/subPages:
 *   get:
 *     summary: Get all subPages
 *     tags: [subPages]
 *     responses:
 *       200:
 *         description: Array of subPages
 *       500:
 *         description: Server error
 */
router.get('/', subPageController.getAllSubpages)

module.exports = router;