// src/validation/auth.schema.ts
import { z } from 'zod';

// in appwrite controller
export const syncUserSchema = z.object({
  email: z.email(), // must be valid email
});

// in auth controller
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(128),
});

// in auth user controller
// roles only in admin
export const createZodUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' }),
  name: z.string().optional(),
  email: z.email({ message: 'Invalid email address' }).optional(),
  roles: z.array(z.enum(['USER'])).optional(),
});

export const createAdminSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' }),
  name: z.string().optional(),
  email: z.email({ message: 'Invalid email address' }).optional(),
  roles: z.array(z.enum(['ADMIN'])).optional(),
});

// Make all fields optional for update
export const updateZodUserSchema = createZodUserSchema.partial();

// Automatically makes a TypeScript type from the Zod schema so types and validation always match
export type SyncUserInput = z.infer<typeof syncUserSchema>;
