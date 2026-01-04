// backend\src\settings\settings.controller.ts

import type { Request, Response } from 'express';
import { settingsDAO } from './settings.dao';
import { createSettingsSchema, updateSettingsSchema } from './settings.zod';
import { handleControllerError } from '../utils/error/errorHandler';
import { BadRequestError } from '../utils/error/errors.types';

const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await settingsDAO.getGlobalSettings();
    return res.status(200).json({ status: true, data: settings });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateAdminNotifications = async (req: Request, res: Response) => {
  try {
    const { adminNotifications } = req.body;

    const updated = await settingsDAO.updateAdminNotifications(
      adminNotifications
    );

    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateSettings = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Κάνουμε validate το input με zod
    // Αν το payload έχει λάθος σχήμα → πετάει error εδώ
    const parsed = updateSettingsSchema.parse(req.body);

    // 2️⃣ Φέρνουμε τα υπάρχοντα settings από τη βάση
    // Τα χρειαζόμαστε για να συγκρίνουμε "πριν" και "μετά"
    const current = await settingsDAO.getGlobalSettings();

    // 🛡️ GUARDS – BRANDING
    // Εδώ προστατεύουμε logos / branding assets
    // ώστε να μην σβηστούν κατά λάθος

    if (parsed.branding) {
      // Αν δεν υπάρχει branding στο DB, βάζουμε empty object
      const currentBranding = current.branding ?? {};

      /**
       * GUARD 1: themeLogo
       * ΤΙ ΕΛΕΓΧΕΙ:
       * - Αν ο client ΕΣΤΕΙΛΕ themeLogo (υπάρχει στο payload)
       * - ΚΑΙ η τιμή είναι falsy (undefined, '', null)
       * - ΚΑΙ στη βάση ΥΠΑΡΧΕΙ ήδη themeLogo
       * ΤΙ ΠΡΟΣΤΑΤΕΥΕΙ:
       * - Να μην σβηστεί υπάρχον logo από μερικό update
       * - Π.χ. PATCH { branding: {} }
       */
      if (
        'themeLogo' in parsed.branding && // το field στάλθηκε
        !parsed.branding.themeLogo && // αλλά είναι άδειο
        currentBranding.themeLogo // ενώ υπήρχε ήδη
      ) {
        throw new BadRequestError('themeLogo cannot be removed accidentally');
      }

      /**
       * GUARD 2: headerFooterLogo
       * Ίδια λογική με το themeLogo
       * Προστατεύει:
       * - το logo header/footer
       * - από overwrite με undefined
       */
      if (
        'headerFooterLogo' in parsed.branding &&
        !parsed.branding.headerFooterLogo &&
        currentBranding.headerFooterLogo
      ) {
        throw new BadRequestError(
          'headerFooterLogo cannot be removed accidentally'
        );
      }

      /**
       * GUARD 3: heroImage
       * Προστατεύει το hero image ώστε να μην σβηστεί από μερικό update
       */
      if (
        'heroImage' in parsed.branding &&
        !parsed.branding.heroImage &&
        currentBranding.heroImage
      ) {
        throw new BadRequestError('heroImage cannot be removed accidentally');
      }
    }

    if (parsed.companyInfo) {
      const currentCompany = current.companyInfo ?? {};

      if (
        'irisBankQR' in parsed.companyInfo &&
        !parsed.companyInfo.irisBankQR &&
        currentCompany.irisBankQR
      ) {
        throw new BadRequestError('irisBankQR cannot be removed accidentally');
      }
    }

    // ✅ Αν περάσουμε όλα τα guards
    // 3️⃣ Κάνουμε update μόνο τα fields που επιτρέπονται
    const updated = await settingsDAO.updateSettings(parsed);

    return res.status(200).json({
      status: true,
      data: updated,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const createSettings = async (req: Request, res: Response) => {
  try {
    // ✅ validation
    const parsed = createSettingsSchema.parse(req.body);

    const created = await settingsDAO.createGlobalSettings(parsed);

    return res.status(201).json({
      status: true,
      data: created,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const settingsController = {
  getSettings,
  updateAdminNotifications,
  updateSettings,
  createSettings,
};
