// backend\src\stripe\routes\email.routes.ts
import express from 'express';
const router = express.Router();
import { emailController } from '../controllers/email.controller';
import { limiter } from '../../utils/limiter';

// pending → confirmed
router.post('/:transactionId', limiter(15,5), emailController.sendThnxEmail);
// confirmed → shipped
router.post('/shipped/:transactionId', limiter(15, 5), emailController.sendShippedEmail);

export default router;
