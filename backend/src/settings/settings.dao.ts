// backend/src/settings/daos/settings.dao.ts
import Settings from './settings.model';
import type { SettingsType } from './settings.types';
import { NotFoundError } from '../utils/error/errors.types';

// single document key
// Στο collection Settings δεν θέλουμε πολλά documents, θέλουμε ένα μόνο που να κρατάει όλα τα global settings της εφαρμογής.
const GLOBAL_KEY = 'global';

const getGlobalSettings = async (): Promise<SettingsType> => {
  const settings = await Settings.findOne({ key: GLOBAL_KEY });
  if (!settings) {
    throw new NotFoundError('Settings not found');
  }
  return settings;
};

// focused update (admin notifications)
const updateAdminNotifications = async (
  adminNotifications: SettingsType['adminNotifications']
): Promise<SettingsType> => {
  return await Settings.findOneAndUpdate(
    { key: GLOBAL_KEY },
    { $set: { adminNotifications } },
    { new: true, upsert: true }
  );
};

// η DB δεν έχει γενικό crud γιατί δεν θα δημιουργουμε χωριστά documents για το settings θα υπάρχει μόνο ένα που θα το αλλάζουμε. οπότε χρειαζόμαστε ένα αρχικό seed αυτού του ενώς. θα γίνει με script


export const settingsDAO = {
  getGlobalSettings,
  updateAdminNotifications,
};
