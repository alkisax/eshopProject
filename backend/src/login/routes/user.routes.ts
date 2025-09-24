import express from 'express';
const router = express.Router();
import { userController } from '../controllers/user.controller';
import { middleware } from '../middleware/verification.middleware';
import { limiter } from '../../utils/limiter';
import { authAppwriteController } from '../controllers/auth.appwrite.controller';

// create
//signup
router.post('/signup/user', limiter(15,5), userController.createUser);

//create admin
router.post('/signup/admin', middleware.verifyToken, middleware.checkRole('ADMIN'), limiter(15,5), userController.createAdmin);

//read
router.get ('/', middleware.verifyToken, middleware.checkRole('ADMIN'), userController.findAll);

router.get('/username/:username', middleware.verifyToken, middleware.checkRole('ADMIN'), userController.readByUsername);

router.get('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), userController.readById);

router.get('/email/:email', middleware.verifyToken, userController.readByEmail);

// update
router.put('/:id', middleware.verifyToken, userController.updateById);
router.put('/toggle-admin/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), userController.toggleRoleById);
router.post('/:id/favorites', middleware.verifyToken, middleware.checkSelfOrAdmin, userController.addTofavorites);
router.delete('/:id/favorites', middleware.verifyToken, middleware.checkSelfOrAdmin, userController.removeFromFavorites);

// appwrite self delete
router.delete('/appwrite-delete', middleware.allowAppwriteSelfDelete, authAppwriteController.deleteAppwriteUser);

// delete self
router.delete('/self/:id', middleware.verifyToken, middleware.checkSelfOrAdmin, userController.deleteById);

// delete
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), userController.deleteById);


export default router;