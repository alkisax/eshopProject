// backend\src\settings\settings.controller.ts

import type { Request, Response } from 'express';
import { settingsDAO } from './settings.dao';
import { handleControllerError } from '../utils/error/errorHandler';

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

export const settingsController = {
  getSettings,
  updateAdminNotifications,
};
