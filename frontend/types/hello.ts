import { z } from 'zod'

/**
 * Hello World Form Types and Schemas
 */

// Shared validation schema - single source of truth
export const helloFormSchema = z.object({
  userInput: z
    .string()
    .min(1, 'Input is required')
    .max(500, 'Input must be less than 500 characters'),
})

// Infer TypeScript types from schema
export type HelloFormInput = z.infer<typeof helloFormSchema>

// Server action success response type
export type HelloFormSuccess = {
  message: string
  data: { userInput: string }
}

