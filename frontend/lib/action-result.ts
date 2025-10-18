import { z } from 'zod'

/**
 * Simple, type-safe result type for Next.js server actions
 * Fully serializable and works perfectly with TanStack Query
 */

// Discriminated union for type-safe results
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { 
      success: false
      error: string
      validationErrors?: Record<string, string[]>
    }

/**
 * Create a success result
 * @example
 * return success({ message: 'User created', id: '123' })
 */
export const success = <T>(data: T): ActionResult<T> => ({
  success: true,
  data,
})

/**
 * Create a failure result
 * @example
 * return failure('Database error')
 * return failure('Validation failed', { email: ['Invalid email'] })
 */
export const failure = <T = never>(
  error: string,
  validationErrors?: Record<string, string[]>
): ActionResult<T> => ({
  success: false,
  error,
  validationErrors,
})

/**
 * Unwrap a result for use with TanStack Query
 * Throws on failure to trigger TanStack Query's error state
 * @example
 * mutationFn: async (input) => unwrapResult(await myAction(input))
 */
export const unwrapResult = <T>(result: ActionResult<T>): T => {
  if (!result.success) {
    const error: any = new Error(result.error)
    error.validationErrors = result.validationErrors
    throw error
  }
  return result.data
}

/**
 * Validate FormData with a Zod schema
 * Returns either the validated data or an ActionResult failure
 * @example
 * const result = validateFormData(formData, formSchema)
 * if (!result.success) return result // Early return with validation error
 * const { validatedField } = result.data // Fully typed!
 */
export const validateFormData = <T extends z.ZodRawShape>(
  formData: FormData,
  schema: z.ZodObject<T>
): ActionResult<z.infer<z.ZodObject<T>>> => {
  // Convert FormData to object
  const data = Object.fromEntries(formData.entries())
  
  // Validate with Zod
  const result = schema.safeParse(data)
  
  if (!result.success) {
    // Use the new Zod v4 API: z.flattenError instead of .flatten()
    const flattened = z.flattenError(result.error)
    const fieldErrors = flattened.fieldErrors as Record<string, string[]>
    
    // Extract the first meaningful error message
    const firstFormError = flattened.formErrors[0]
    const firstFieldWithError = Object.keys(fieldErrors)[0]
    const firstFieldError = firstFieldWithError 
      ? fieldErrors[firstFieldWithError]?.[0] 
      : undefined
    
    // Use the most specific error message available
    const errorMessage = firstFieldError || firstFormError || 'Validation failed'
    
    return failure(
      errorMessage,
      fieldErrors
    )
  }
  
  return success(result.data)
}

/**
 * Validate object data with a Zod schema
 * Returns either the validated data or an ActionResult failure
 * @example
 * const result = validateData(input, inputSchema)
 * if (!result.success) return result // Early return with validation error
 * const { validatedField } = result.data // Fully typed!
 */
export const validateData = <T extends z.ZodTypeAny>(
  data: unknown,
  schema: T
): ActionResult<z.infer<T>> => {
  // Validate with Zod
  const result = schema.safeParse(data)
  
  if (!result.success) {
    // Use the new Zod v4 API: z.flattenError instead of .flatten()
    const flattened = z.flattenError(result.error)
    const fieldErrors = flattened.fieldErrors as Record<string, string[]>
    
    // Extract the first meaningful error message
    const firstFormError = flattened.formErrors[0]
    const firstFieldWithError = Object.keys(fieldErrors)[0]
    const firstFieldError = firstFieldWithError 
      ? fieldErrors[firstFieldWithError]?.[0] 
      : undefined
    
    // Use the most specific error message available
    const errorMessage = firstFieldError || firstFormError || 'Validation failed'
    
    return failure(
      errorMessage,
      fieldErrors
    )
  }
  
  return success(result.data)
}

