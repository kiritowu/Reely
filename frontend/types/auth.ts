import { z } from 'zod'

/**
 * Auth Form Types and Schemas
 */

// Whitelisted email domains
export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'protonmail.com',
  'proton.me',
  'live.com',
  'msn.com',
  'aol.com',
] as const

// Helper function to check if email domain is allowed
export function isEmailDomainAllowed(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_EMAIL_DOMAINS.includes(domain as any)
}

// Sign up schema
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .refine(isEmailDomainAllowed, {
      message: `Email must be from an allowed domain: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`,
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Sign in schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

// Infer TypeScript types
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

// Server action success types
export type AuthSuccess = {
  message: string
  requiresEmailVerification?: boolean
}

