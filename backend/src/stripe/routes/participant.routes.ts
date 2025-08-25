import express from 'express';
const router = express.Router();
import { participantController } from '../controllers/participant.controller';
import { middleware } from '../../login/middleware/verification.middleware';

router.get ('/', middleware.verifyToken, middleware.checkRole('ADMIN'), participantController.findAll);
router.post('/', participantController.create);
router.delete('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), participantController.deleteById);

export default router;