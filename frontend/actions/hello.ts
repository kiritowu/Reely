'use server'

import { success, failure, validateFormData, type ActionResult } from '@/lib/action-result'
import { helloFormSchema, type HelloFormSuccess } from '@/types'

/**
 * Server Action: Hello World Form Submission
 * Validates input and logs it in the backend
 */
export async function submitHelloForm({
  formData,
}: {
  formData: FormData
}): Promise<ActionResult<HelloFormSuccess>> {
  // Validate FormData with Zod - one line! 🎉
  const validated = validateFormData(formData, helloFormSchema)
  if (!validated.success) return validated

  // Fully typed validated data
  const { userInput } = validated.data

  // Log the validated input in the backend
  console.log('✅ Server Action received input:', userInput)
  console.log('📅 Timestamp:', new Date().toISOString())

  // Simulate some backend processing
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return success({
      message: 'Form submitted successfully!',
      data: { userInput },
    })
  } catch (error) {
    console.error('❌ Server Action error:', error)
    return failure('An unexpected error occurred during processing')
  }
}

