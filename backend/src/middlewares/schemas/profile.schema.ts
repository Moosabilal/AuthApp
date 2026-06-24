import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(64, 'Name cannot exceed 64 characters')
    .optional(),
});

export const requestEmailChangeSchema = z.object({
  newEmail: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
});

export const verifyEmailChangeSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;
