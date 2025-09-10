import { Router } from 'express';
import { commodityController } from '../controllers/commodity.controller';
import { middleware } from '../../login/middleware/verification.middleware';

const router = Router();

// 📖 Public: list and view commodities
router.get('/', commodityController.findAll);
router.get('/categories', commodityController.getAllCategories);

// 🛒 Admin: view all comments across commodities
router.get('/comments', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.getAllComments);

// 📖 Individual commodity by id → must come AFTER static routes
router.get('/:id', commodityController.findById);

// 🛒 Admin: create, update, delete commodities
router.post('/', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.create);
router.patch('/sell/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.sellById);
router.patch('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.updateById);
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteById);

// 💬 Comments
router.post('/:id/comments', middleware.verifyToken, commodityController.addComment);
router.delete('/:id/comments', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.clearComments);
router.delete('/:id/comments/:commentId', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteComment);

export default router;
