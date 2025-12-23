// D:\coding\eshopProject\backend\src\stripe\routes\category.routes.ts
import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { middleware } from '../../login/middleware/verification.middleware';

const router = Router();

// ✅ open or admin-only depending on needs
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

router.post('/', middleware.verifyToken, middleware.checkRole('ADMIN'), categoryController.createCategory);
router.patch('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), categoryController.updateCategory);
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), categoryController.deleteCategory);

router.put('/:id/toggle-tag', middleware.verifyToken, middleware.checkRole('ADMIN'), categoryController.toggleIsTag);
router.post('/make-parent', middleware.verifyToken, middleware.checkRole('ADMIN'), categoryController.makeParentOf);
router.put('/:id/remove-parent', middleware.verifyToken, middleware.checkRole('ADMIN'), categoryController.removeParent);

export default router;
