// src/validation/commerce.schema.ts
import mongoose from 'mongoose';
import { z } from 'zod';

// Regex for MongoDB ObjectId (24 hex chars)
// 🔹 Reusable ObjectId validator
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')
  .transform((val) => new mongoose.Types.ObjectId(val));

// used in participant controller
export const createParticipantSchema = z.object({
  user: z.string().optional(), // comes from middleware OR request
  name: z.string().max(100).optional().default(''),
  surname: z.string().max(100).optional().default(''),
  email: z.email('Invalid email address'),
});

// used in cart controller
export const cartItemChangeSchema = z.object({
  commodityId: objectId,
  variantId: objectId.optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(-999999, 'Quantity too low') // allow negative for removal
    .max(1000, 'Quantity too high'),
});

export const cartItemUpdateSchema = z.object({
  commodityId: objectId,
  variantId: objectId.optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity must be at least 0')
    .max(1000, 'Quantity too high'),
});

// in category controller
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  isTag: z.boolean().optional().default(false),
  parent: objectId.optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isTag: z.boolean().optional(),
  parent: objectId.optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly')
    .optional(),
});

export const participantParamSchema = z.object({
  participantId: objectId,
});

// in commodity controller

// Matches Editor.js data structure
const editorJsDataSchema = z.object({
  time: z.number(),
  blocks: z.array(
    z.object({
      id: z.string().optional(),
      type: z.string(),
      data: z.record(z.string(), z.any()),
    })
  ),
  version: z.string(),
});

const variantAttributesSchema = z.record(z.string().min(1), z.string().min(1));

const commodityVariantSchema = z.object({
  attributes: variantAttributesSchema,
  sku: z.string().optional(),
  active: z.boolean().optional().default(true),
});

export const createCommoditySchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(2000).optional(),
    category: z.array(z.string()).default([]), // ✅ matches Mongoose
    price: z.number().min(0, 'Price must be non-negative'),
    currency: z.string().default('eur'),
    stripePriceId: z.string().min(1, 'Stripe Price ID is required'),
    stock: z.number().int().min(0).default(0),
    active: z.boolean().default(true),
    images: z.array(z.string()).optional(),
    variants: z.array(commodityVariantSchema).optional(),
    requiresProcessing: z.boolean().optional().default(false),
    processingTimeDays: z.number().int().min(0).optional(),
  })
  .refine(
    // Αν ΔΕΝ υπάρχουν variants → OK
    // Αν ΥΠΑΡΧΟΥΝ variants → ΠΡΕΠΕΙ να έχουν τουλάχιστον 1 στοιχείο
    // Απαγορεύουμε το invalid state: variants: [] (υποτίθετε οτι έχει variants αλλα αυτά δεν υπάρχουν)
    (data) => !data.variants || data.variants.length > 0,
    {
      // Μήνυμα σφάλματος που θα επιστραφεί αν αποτύχει το validation
      message: 'Variants array cannot be empty',

      // Δηλώνουμε ότι το σφάλμα αφορά το πεδίο "variants"
      // ώστε το frontend / admin form να το εμφανίσει σωστά
      path: ['variants'],
    }
  );

export const updateCommoditySchema = createCommoditySchema.partial();

export const createCommentSchema = z.object({
  user: objectId,
  text: z.union([
    z.string().min(1, 'Comment text is required'),
    editorJsDataSchema,
  ]),
  rating: z
    .union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .optional(),
  isApproved: z.boolean().optional().default(true),
});

export const updateCommentSchema = z.object({
  isApproved: z.boolean(),
});

// in stripe controller
export const checkoutSessionSchema = z.object({
  participantId: objectId,
  participantInfo: z.object({
    _id: objectId,
    name: z.string().min(1).max(100).optional(),
    email: z.email(),
  }),
  shippingInfo: z
    .object({
      fullName: z.string().min(1).max(100),
      addressLine1: z.string().min(1).max(200),
      addressLine2: z.string().optional(),
      city: z.string().min(1).max(100),
      postalCode: z.string().min(1).max(20),
      country: z.string().min(2).max(50),
      phone: z.string().optional(),
      notes: z.string().max(500).optional(),
      shippingEmail: z.email().optional(), //  this because frontend sends it
    })
    .passthrough(), //allow extra keys like `shippingMethod`
});

// Derived type for TS
// Stripe checkout
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
export type CreateCommodityInput = z.infer<typeof createCommoditySchema>;
export type UpdateCommodityInput = z.infer<typeof updateCommoditySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CartItemChangeInput = z.infer<typeof cartItemChangeSchema>;
export type CartItemUpdateInput = z.infer<typeof cartItemUpdateSchema>;
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
