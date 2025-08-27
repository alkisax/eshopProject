import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { middleware } from '../../login/middleware/verification.middleware';

const router = Router();

// Every cart is tied to a participant, so require auth
router.get('/:participantId', middleware.verifyToken, cartController.getCart);
router.post('/', middleware.verifyToken, cartController.createCart);
router.patch('/:participantId/items', middleware.verifyToken, cartController.addOrRemoveItem);
router.patch('/:participantId/items/update', middleware.verifyToken, cartController.updateQuantity);
router.delete('/:participantId', middleware.verifyToken, cartController.clearCart);

export default router;
