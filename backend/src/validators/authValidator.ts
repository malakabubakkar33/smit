import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(2, 'Username or Roll Number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters').max(100),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  mobileNumber: z.string().min(8, 'Mobile number must be at least 8 digits'),
  rollNumber: z.string().min(2, 'Roll Number is required').max(30),
  email: z.string().email('Please provide a valid email address'),
  avatarUrl: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  mobileNumber: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
});
