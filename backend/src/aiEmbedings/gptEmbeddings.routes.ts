import express from 'express';
import { gptEmbedingsController } from './gptEmbedingsController';
import { middleware } from '../login/middleware/verification.middleware';

const router = express.Router();

router.post('/vectorize/all', middleware.verifyToken, middleware.checkRole('ADMIN'), gptEmbedingsController.vectorizeAllHandler);
router.post('/vectorize/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), gptEmbedingsController.vectorizeOneHandler);

router.get('/search', gptEmbedingsController.searchHandler);

export default router;
