import express from 'express';
const router = express.Router();
import { subPageController } from '../controllers/subPage.controller';

router.post('/', subPageController.createSubPage);

router.get('/', subPageController.getAllSubPages);

router.put('/:subPageId', subPageController.editSubPage);

router.delete('/:subPageId', subPageController.deleteSubPage);

export default router;