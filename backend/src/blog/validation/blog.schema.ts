// backend/src/blog/validation/blog.schema.ts
import mongoose from 'mongoose';
import { z } from 'zod';

// 🔹 Reusable MongoDB ObjectId validator
export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')
  .transform((val) => new mongoose.Types.ObjectId(val));

// in subpage controller
export const createSubPageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const editSubPageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

export const subPageParamSchema = z.object({
  subPageId: objectId,
});

// in posts controller
// 🔹 Matches Editor.js structure
export const editorJsDataSchema = z.object({
  time: z.number(),
  blocks: z.array(
    z.object({
      id: z.string().optional(),
      type: z.string(),
      data: z.record(z.string(), z.any()),
    })
  ).min(1, 'EditorJS must contain at least one block'),
  version: z.string(),
});

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: editorJsDataSchema,
  subPage: objectId,
  pinned: z.boolean().optional().default(false),
});

export const editPostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: editorJsDataSchema,
  subPage: objectId.optional(),
  pinned: z.boolean().optional(),
});

// Derived types
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type EditPostInput = z.infer<typeof editPostSchema>;
export type CreateSubPageInput = z.infer<typeof createSubPageSchema>;
export type EditSubPageInput = z.infer<typeof editSubPageSchema>;
export type SubPageParamInput = z.infer<typeof subPageParamSchema>;
