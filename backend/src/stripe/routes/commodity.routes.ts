import { Router } from 'express';
import { commodityController } from '../controllers/commodity.controller';
import { middleware } from '../../login/middleware/verification.middleware';

const router = Router();

// Public
router.get('/', commodityController.findAll);
router.get('/categories', commodityController.getAllCategories);

// Admin: comments
router.get('/comments', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.getAllComments);
router.post('/:id/comments', middleware.verifyToken, commodityController.addComment);
router.patch('/:commodityId/comments/:commentId', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.updateComment);
router.delete('/:id/comments', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.clearComments);
router.delete('/:id/comments/:commentId', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteComment);

// Individual commodity (keep after static routes)
router.get('/:id', commodityController.findById);

// Admin: commodities
router.post('/', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.create);
router.patch('/sell/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.sellById);
router.patch('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.updateById);
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteById);

export default router;
