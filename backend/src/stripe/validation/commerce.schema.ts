// src/validation/commerce.schema.ts
import { z } from 'zod';

// Regex for MongoDB ObjectId (24 hex chars)
// const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Participant creation schema
export const createParticipantSchema = z.object({
  user: z.string().optional(), // comes from middleware OR request
  name: z.string().min(1, 'Name is required').max(100),
  surname: z.string().min(1, 'Surname is required').max(100),
  email: z.email('Invalid email address'),
});

// Derived type for TS
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
