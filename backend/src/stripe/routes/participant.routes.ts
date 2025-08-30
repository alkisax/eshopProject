import express from 'express';
const router = express.Router();
import { participantController } from '../controllers/participant.controller';
import { middleware } from '../../login/middleware/verification.middleware';

router.post('/', participantController.create);
router.get ('/', middleware.verifyToken, middleware.checkRole('ADMIN'), participantController.findAll);
router.get('/by-email', participantController.findByEmail);
router.get('/:id', participantController.findById);
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), participantController.deleteById);


export default router;