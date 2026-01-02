// backend/src/settings/daos/settings.dao.ts
import Settings from './settings.model';
import type { SettingsType, SettingsUpdateInput } from './settings.types';
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

const getEmailTemplates = async () => {
  const settings = await getGlobalSettings();
  return settings.emailTemplates || {};
};

const updateEmailTemplates = async (
  emailTemplates: SettingsType['emailTemplates']
): Promise<SettingsType> => {
  return await Settings.findOneAndUpdate(
    { key: GLOBAL_KEY },
    { $set: { emailTemplates } },
    { new: true, upsert: true }
  );
};

// Generic update for settings
// Δέχεται μόνο όσα fields θέλουμε να αλλάξουμε
// Omit<SettingsType, 'key'> → Παίρνει το SettingsType και αφαιρεί το πεδίο key
const updateSettings = async (
  data: SettingsUpdateInput
): Promise<SettingsType> => {
  const updated = await Settings.findOneAndUpdate(
    { key: GLOBAL_KEY },
    { $set: data },
    { new: true, upsert: true }
  );

  if (!updated) {
    throw new NotFoundError('Settings not found');
  }

  return updated;
};

// η DB δεν έχει γενικό crud γιατί δεν θα δημιουργουμε χωριστά documents για το settings θα υπάρχει μόνο ένα που θα το αλλάζουμε. οπότε χρειαζόμαστε ένα αρχικό seed αυτού του ενώς. θα γίνει με script

const createGlobalSettings = async (
  data: Partial<Omit<SettingsType, 'key'>>
): Promise<SettingsType> => {
  const created = await Settings.create({
    key: GLOBAL_KEY,
    ...data,
  });

  return created;
};

export const settingsDAO = {
  getGlobalSettings,
  updateAdminNotifications,
  getEmailTemplates,
  updateEmailTemplates,
  updateSettings,
  createGlobalSettings,
};
