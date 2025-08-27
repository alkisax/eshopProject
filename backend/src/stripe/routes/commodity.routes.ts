import { Router } from 'express';
import { commodityController } from '../controllers/commodity.controller';
import { middleware } from '../../login/middleware/verification.middleware';

const router = Router();

// 📖 Public: list and view commodities
router.get('/', commodityController.findAll);
router.get('/:id', commodityController.findById);

// 🛒 Admin: create, update, delete commodities
router.post('/', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.create);
// PATCH: decrease stock & increase soldCount
router.patch('/sell/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.sellById);
router.patch('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.updateById);
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteById);

// 💬 Comments
// Logged-in user can add a comment
router.post('/:id/comments', middleware.verifyToken, commodityController.addComment);

// Admin can clear all comments
router.delete('/:id/comments', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.clearComments);

export default router;
