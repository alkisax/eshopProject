// backend\src\stripe\routes\commodity.routes.ts
import { Router } from 'express';
import { commodityController } from '../controllers/commodity.controller';
import { middleware } from '../../login/middleware/verification.middleware';

const router = Router();

// Public
router.get('/', commodityController.findAll);

router.get('/categories', commodityController.getAllCategories);

router.get('/slug/:slug', commodityController.findBySlug);

// Admin: comments
router.get('/comments', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.getAllComments);

router.delete('/comments/clear/old-unapproved', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteOldUnapprovedComments);

router.post('/:id/comments', middleware.verifyToken, commodityController.addComment);

router.patch('/:commodityId/comments/:commentId', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.updateComment);

router.delete('/:id/comments', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.clearComments);

router.delete('/:id/comments/:commentId', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteComment);

// Individual commodity (keep after static routes)

router.get('/:id', commodityController.findById);

// Admin: commodities
router.post('/', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.create);

router.get( '/comments/user/:userId', middleware.verifyToken, middleware.checkSelfOrAdmin, commodityController.getCommentsByUser );

router.patch('/sell/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.sellById);

router.patch('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.updateById);

router.delete( '/comments/user/:userId', middleware.verifyToken, middleware.checkSelfOrAdmin, commodityController.deleteAllCommentsByUser );

router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.deleteById);

export default router;
