// backend\src\settings\settings.routes.ts
import express from 'express';
import { settingsController } from './settings.controller';
import { middleware } from '../login/middleware/verification.middleware';

const router = express.Router();

// GET global settings
router.get(
  '/',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  settingsController.getSettings
);

// UPDATE admin notifications settings
router.put(
  '/admin-notifications',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  settingsController.updateAdminNotifications
);

export default router;
