'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/db/schema'
import { success, failure, validateFormData, type ActionResult } from '@/lib/action-result'
import { signUpSchema, signInSchema, type AuthSuccess } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Server Action: Sign Up
 * Creates a new user with email/password and sends verification email
 * Only allows whitelisted email domains
 */
export async function signUp({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<ActionResult<AuthSuccess>> {
  // Validate input using our abstraction
  // Note: We convert to FormData-like object for consistency with validateFormData
  const formDataObj = new FormData()
  formDataObj.append('email', email)
  formDataObj.append('password', password)
  formDataObj.append('confirmPassword', password)
  
  const validated = validateFormData(formDataObj, signUpSchema)
  if (!validated.success) return validated

  const supabase = await createClient()

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return failure(error.message)
  }

  if (!data.user) {
    return failure('Failed to create user')
  }

  // Create profile in database (will be used after email verification)
  try {
    await db.insert(profiles).values({
      userId: data.user.id,
      email: validated.data.email,
      fullName: null,
      avatarUrl: null,
    })
  } catch (dbError) {
    console.error('Failed to create profile:', dbError)
    // Don't fail the signup if profile creation fails
    // The profile can be created later
  }

  return success({
    message: 'Check your email to verify your account',
    requiresEmailVerification: true,
  })
}

/**
 * Server Action: Sign In
 * Authenticates user with email/password
 * Requires email verification to be completed
 */
export async function signIn({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<ActionResult<AuthSuccess>> {
  // Validate input using our abstraction
  const formDataObj = new FormData()
  formDataObj.append('email', email)
  formDataObj.append('password', password)
  
  const validated = validateFormData(formDataObj, signInSchema)
  if (!validated.success) return validated

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (error) {
    return failure('Invalid email or password')
  }

  if (!data.user) {
    return failure('Failed to sign in')
  }

  // Check if email is verified
  if (!data.user.email_confirmed_at) {
    // Sign out the user
    await supabase.auth.signOut()
    return failure('Please verify your email before signing in')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Server Action: Sign Out
 * Logs out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth')
}

/**
 * Server Action: Get Current User
 * Returns the currently authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
