import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { middleware } from '../../login/middleware/verification.middleware';

const router = Router();

// Every cart is tied to a participant, so require auth
router.get('/', cartController.getAllCarts);
router.get('/:participantId', cartController.getCart);
router.post('/', cartController.createCart);
router.patch('/:participantId/items', cartController.addOrRemoveItem);
router.patch('/:participantId/items/update', cartController.updateQuantity);
router.delete('/:participantId', cartController.clearCart);
router.delete('/clear/old', middleware.verifyToken, middleware.checkRole('ADMIN'),  cartController.deleteOldCarts);

export default router;
