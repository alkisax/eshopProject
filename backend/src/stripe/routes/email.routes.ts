import express from 'express';
const router = express.Router();
import { emailController } from '../controllers/email.controller';

router.post('/:transactionId', emailController.sendThnxEmail);

export default router;
