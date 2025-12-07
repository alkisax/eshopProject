import mongoose from 'mongoose';
import Commodity from '../stripe/models/commodity.models';
import { slugify } from '../utils/slugify';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGO_URΙ ?? '';

async function runMigration() {
  try {
    console.log(JSON.stringify(MONGODB_URI));
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const commodities = await Commodity.find({});
    console.log(`Found ${commodities.length} commodities`);

    for (const item of commodities) {
      let modified = false;

      if (!item.uuid) {
        item.uuid = uuidv4();
        modified = true;
      }

      if (!item.slug) {
        item.slug = slugify(item.name);
        modified = true;
      }

      if (modified) {
        await item.save({ validateBeforeSave: false }); 
        console.log(`Updated: ${item.name}`);
      }
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runMigration();
