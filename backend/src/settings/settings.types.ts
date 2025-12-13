// backend\src\settings\settings.types.ts
import type { Document } from 'mongoose';

export interface AdminNotificationsSettings {
  salesNotificationsEnabled: boolean;
  adminEmail?: string;
}

export interface SettingsType extends Document {
  key: string; // π.χ. 'global'
  adminNotifications: AdminNotificationsSettings;
  createdAt?: Date;
  updatedAt?: Date;
}
