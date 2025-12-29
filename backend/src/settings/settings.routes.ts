// backend/src/settings/settings.routes.ts
import express from 'express';
import { settingsController } from './settings.controller';
import { middleware } from '../login/middleware/verification.middleware';

const router = express.Router();

/**
 * GET /settings
 * Επιστρέφει ΟΛΑ τα global settings
 */
router.get(
  '/',
  settingsController.getSettings
);

/**
 * =========================================================
 * POST /api/settings
 * ---------------------------------------------------------
 * Δημιουργεί το αρχικό "global" settings document
 *
 * ✔ ΜΟΝΟ ADMIN
 * ✔ Χρησιμοποιείται:
 *   - seed
 *   - dev / first deploy
 *
 * ⚠️ ΠΡΟΣΟΧΗ:
 * - ΠΡΕΠΕΙ να καλεστεί μόνο μία φορά
 * - Αν υπάρχει ήδη document → duplicate key error (σωστό)
 * =========================================================
 */
router.post(
  '/',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  settingsController.createSettings
);

/**
 * PUT /settings/admin-notifications
 * Focused update μόνο για admin notifications
 * Κρατιέται για backward compatibility
 */
router.put(
  '/admin-notifications',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  settingsController.updateAdminNotifications
);

/**
 * PATCH /settings
 * Generic update για settings
 * Δέχεται ΜΟΝΟ όσα fields σταλούν στο body
 * Π.χ.:
 * {
 *   branding: { themeLogo: '...' }
 * }
 */
router.patch(
  '/',
  middleware.verifyToken,
  middleware.checkRole('ADMIN'),
  settingsController.updateSettings
);

export default router;
