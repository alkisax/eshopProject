import 'dotenv/config';
import mongoose from 'mongoose';
import Settings from './settings.model';

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error('MONGODB_URI is missing');
}

const seedSettings = async () => {
  await mongoose.connect(MONGO_URI);

  const exists = await Settings.findOne({ key: 'global' });
  if (exists) {
    console.log('⚠️ Settings already exist, skipping seed');
    process.exit(0);
  }

  await Settings.create({
    key: 'global',
    adminNotifications: {
      salesNotificationsEnabled: false,
      adminEmail: '',
    },
  });

  console.log('✅ Global settings seeded');
  process.exit(0);
};

seedSettings().catch((err) => {
  console.error('❌ Seed failed', err);
  process.exit(1);
});


// ΤΡΕΞΙΜΟ από backend root (όχι μέσα στο folder): npx ts-node src/settings/settings.scripts.seedSettings.ts