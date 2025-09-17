import express from 'express';
import { aiModerationController } from './moderation.controller';

const router = express.Router();

router.post('/', aiModerationController.moderationResult);

export default router;
