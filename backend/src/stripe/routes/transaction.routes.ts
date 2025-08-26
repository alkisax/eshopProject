import { Router } from 'express';
const router = Router();
import { transactionController } from '../controllers/transactionController';
import { middleware } from '../../login/middleware/verification.middleware';

// GET all transactions (admin only)
router.get('/', middleware.verifyToken, middleware.checkRole('ADMIN'), transactionController.findAll);

// GET unprocessed transactions (admin only)
router.get('/unprocessed', middleware.verifyToken, middleware.checkRole('ADMIN'), transactionController.findUnprocessed);

// POST create a new transaction (no auth yet)
router.post('/', transactionController.create);

// DELETE a transaction by ID (admin only)
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), transactionController.deleteById);

// αυτο είναι σημαντικό γιατι στέλνει το αυτόματο ημαιλ
router.put('/toggle/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), transactionController.toggleProcessed);

export default router;