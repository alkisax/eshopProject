import express from 'express';
const router = express.Router();
import { emailController } from '../controllers/email.controller';
import { limiter } from '../../utils/limiter';

router.post('/:transactionId', limiter(15,5), emailController.sendThnxEmail);

export default router;
