// backend/src/settings/models/settings.model.ts
import mongoose from 'mongoose';
import type { SettingsType } from './settings.types';

const Schema = mongoose.Schema;

const adminNotificationsSchema = new Schema(
  {
    salesNotificationsEnabled: {
      type: Boolean,
      default: false,
    },
    adminEmail: {
      type: String,
    },
  },
  { _id: false }
);

const settingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    adminNotifications: {
      type: adminNotificationsSchema,
      default: {},
    },
  },
  {
    collection: 'Settings',
    timestamps: true,
  }
);

export default mongoose.model<SettingsType>('Settings', settingsSchema);
