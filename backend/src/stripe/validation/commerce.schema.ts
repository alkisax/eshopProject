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
  name: z.string().min(1, 'Name is required').max(100),
  surname: z.string().min(1, 'Surname is required').max(100),
  email: z.email('Invalid email address'),
});

// used in cart controller
export const cartItemChangeSchema = z.object({
  commodityId: objectId,
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(-100, 'Quantity too low') // allow negative for removal
    .max(1000, 'Quantity too high'),
});

export const cartItemUpdateSchema = z.object({
  commodityId: objectId,
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
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
});

// Category update — same fields but all optional
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isTag: z.boolean().optional(),
  parent: objectId.optional(),
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly')
    .optional(),
});

export const participantParamSchema = z.object({
  participantId: objectId,
});

// Derived type for TS
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CartItemChangeInput = z.infer<typeof cartItemChangeSchema>;
export type CartItemUpdateInput = z.infer<typeof cartItemUpdateSchema>;
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
