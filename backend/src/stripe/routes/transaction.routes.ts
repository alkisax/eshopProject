// backend\src\stripe\routes\transaction.routes.ts
import { Router } from 'express';
const router = Router();
import { transactionController } from '../controllers/transactionController';
import { middleware } from '../../login/middleware/verification.middleware';
import { limiter } from '../../utils/limiter';

// GET all transactions (admin only)
router.get(
  '/',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.findAll
);

// GET unprocessed transactions (admin only)
router.get(
  '/unprocessed',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.findUnprocessed
);

// get all transactions by participant id. to create an "previous pirchaces" - needs login or else can acces other people transactions
// router.get('/participant/:participantId', middleware.verifyToken, transactionController.findByParticipant);
router.get(
  '/participant/:participantId',
  transactionController.findByParticipant
);

router.get(
  '/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.findById
);
// POST create a new transaction (no auth yet)
router.post('/', limiter(15, 5), transactionController.create);

// αυτο είναι σημαντικό γιατι στέλνει το αυτόματο ημαιλ
// πλέων έχει αντικατασταθεί απο τις επόμενες δύο αλλα μένει για legasy/backward compatability και γιατι χρειάζετε στο dev για reverse
router.put(
  '/toggle/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.toggleProcessed
);

// 🧾 CONFIRM (pending → confirmed) στέλνει το αυτόματο ημαιλ
router.post(
  '/confirm/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.markConfirmed
);

// 🚚 SHIP (confirmed → shipped) στέλνει το αυτόματο ημαιλ
router.post(
  '/ship/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.markShipped
);

// DELETE a transaction by ID (admin only)
router.delete(
  '/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.deleteById
);

router.delete(
  '/clear/old',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.deleteOldProcessedTransactions
);

export default router;
