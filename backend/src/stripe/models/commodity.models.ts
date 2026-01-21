// backend\src\stripe\models\commodity.models.ts
// DONE add slug to commodity so as to have slug urls

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from '../../utils/slugify';
import type { CommodityType } from '../types/stripe.types';

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: Schema.Types.Mixed,
      required: true,
    }, // string OR EditorJsData
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const variantSchema = new Schema(
  {
    attributes: {
      type: Map,
      of: String,
      required: true,
    },
    sku: {
      type: String,
    },
    stripePriceId: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // stock: { type: Number } // για μελλοντική χρήση
  },
  {
    _id: true,
    timestamps: false,
  },
);

const commoditySchema = new Schema(
  {
    uuid: {
      type: String,
      unique: true,
      default: uuidv4,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // Επειδή έχω ήδη products στη DB χωρίς slug → χωρίς sparse: true, το MongoDB θα πετάξει duplicate key error για τα "null" slugs.
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    tips: {
      type: String,
      default: '',
    },
    category: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'eur',
    },
    stripePriceId: {
      type: String,
      required: true,
      unique: true,
    },
    soldCount: {
      type: Number,
      default: 0,
      validate: (value: number) => value >= 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot go below 0'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    images: [{ type: String }],
    comments: {
      type: [commentSchema],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: undefined,
    },
    requiresProcessing: {
      type: Boolean,
      default: false,
    },
    processingTimeDays: {
      type: Number,
      min: 0,
    },
    // (αλλαγές για delivery) flag για "instant delivery" εμπορεύματα
    isInstantDeliveryItem: {
      type: Boolean,
      default: false,
    },
    vector: {
      // θα προσθέσουμε vector embedings για cosine similarity αναζήτηση. Θα είναι vectorised το όνομα και η περιγραφή
      type: [Number], // array of floats (1536 long when populated)
      default: undefined, // stays empty until you generate it
    },
  },
  {
    timestamps: true,
    collection: 'commodities',
  },
);

// Στο Mongoose υπάρχει η έννοια των middleware hooks. Είναι functions που τρέχουν πριν ή μετά από κάποια ενέργεια.
// function (next) {} Αυτή είναι η function που θα τρέξει πριν το save.
commoditySchema.pre('save', function (next) {
  // Μόνο αν δεν υπάρχει ήδη slug
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

export default mongoose.model<CommodityType>('Commodity', commoditySchema);
