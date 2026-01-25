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

// get all iris transactions
router.get(
  '/iris',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.getIrisTransactions
);

// get all COD transactions
router.get(
  '/cod',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.getCodTransactions
);

// get all transactions by participant id. to create an "previous pirchaces" - needs login or else can acces other people transactions
// αυτή σχετίζετε με την /my παρακάτω και ποιο πριν ήταν μια που έσπασε σε δύο. Το πρόβλημα είναι οτι τα transaction πρέπει να τα βλέπει ο admin αλλά πρέπει να τα βλέπει και ο user (τα δικά του) για να μπορέι να δεί τις παλιές αγορές του. Το πρόβλημα ήταν πως ένας user θα βλέπει τα δικά του και όχι άλλων
router.get(
  '/participant/:participantId',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.findByParticipant
);

router.get(
  '/my',
  middleware.verifyToken,
  transactionController.findMyTransactions
);

// ✅ (αλλαγές για delivery) status polling by public tracking token (PUBLIC)
router.get('/status/:token', transactionController.getStatusByTrackingToken);

router.get(
  '/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.findById
);

// POST create a new transaction (no auth yet)
router.post('/', limiter(1000, 60), transactionController.create);

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

// ❌ CANCEL (pending → cancelled)
router.post(
  '/cancel/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.cancelTransaction
);

// soft delete a transaction by ID (admin only)
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

router.delete(
  '/hard/:id',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  transactionController.hardDeleteById
);

export default router;
