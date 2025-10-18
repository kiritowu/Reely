'use server'

import { db } from '@/lib/db'
import { contentSources } from '@/db/schema'
import { success, failure, validateData, type ActionResult } from '@/lib/action-result'
import {
  createContentSourceSchema,
  updateContentSourceSchema,
  toggleSourceActiveSchema,
  deleteSourceSchema,
  type CreateContentSourceInput,
  type UpdateContentSourceInput,
  type ToggleSourceActiveInput,
  type DeleteSourceInput,
  type ContentSourceSuccess,
} from '@/types'
import { getCurrentUser } from './auth'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: Create Content Source
 * Creates a new content source for the authenticated user
 */
export async function createContentSource(
  input: CreateContentSourceInput
): Promise<ActionResult<ContentSourceSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to create a content source')
    }

    // Validate input
    const validated = validateData(input, createContentSourceSchema)
    if (!validated.success) return validated

    // Create content source
    const [source] = await db
      .insert(contentSources)
      .values({
        userId: user.id,
        sourceType: validated.data.sourceType,
        sourceUrl: validated.data.sourceUrl,
        displayName: validated.data.displayName,
        description: validated.data.description || null,
        category: validated.data.category,
        scrapeFrequency: validated.data.scrapeFrequency,
        isActive: validated.data.isActive,
      })
      .returning()

    // Trigger backend to fetch latest content from the URL
    const backendUrl = process.env.BACKEND_URL
    if (backendUrl && validated.data.sourceUrl) {
      const fetchUrl = `${backendUrl}/latest?url=${encodeURIComponent(validated.data.sourceUrl)}`
      fetch(fetchUrl).catch((error) => {
      })
    } else {
      console.warn('⚠️ Backend URL not configured or source URL missing')
    }

    revalidatePath('/dashboard')

    return success({
      message: 'Content source created successfully',
      sourceId: source.id,
    })
  } catch (error) {
    console.error('Create content source error:', error)
    return failure('Failed to create content source. Please try again.')
  }
}

/**
 * Server Action: Update Content Source
 * Updates an existing content source
 */
export async function updateContentSource(
  input: UpdateContentSourceInput
): Promise<ActionResult<ContentSourceSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to update a content source')
    }

    // Validate input
    const validated = validateData(input, updateContentSourceSchema)
    if (!validated.success) return validated

    // Check if source exists and belongs to user
    const existingSource = await db.query.contentSources.findFirst({
      where: and(
        eq(contentSources.id, validated.data.id),
        eq(contentSources.userId, user.id)
      ),
    })

    if (!existingSource) {
      return failure('Content source not found')
    }

    // Update content source
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (validated.data.sourceType !== undefined) updateData.sourceType = validated.data.sourceType
    if (validated.data.sourceUrl !== undefined) updateData.sourceUrl = validated.data.sourceUrl
    if (validated.data.displayName !== undefined) updateData.displayName = validated.data.displayName
    if (validated.data.description !== undefined) updateData.description = validated.data.description
    if (validated.data.category !== undefined) updateData.category = validated.data.category
    if (validated.data.scrapeFrequency !== undefined) updateData.scrapeFrequency = validated.data.scrapeFrequency
    if (validated.data.isActive !== undefined) updateData.isActive = validated.data.isActive

    await db
      .update(contentSources)
      .set(updateData)
      .where(eq(contentSources.id, validated.data.id))

    revalidatePath('/dashboard')

    return success({
      message: 'Content source updated successfully',
      sourceId: validated.data.id,
    })
  } catch (error) {
    console.error('Update content source error:', error)
    return failure('Failed to update content source. Please try again.')
  }
}

/**
 * Server Action: Toggle Source Active Status
 * Enables or disables a content source
 */
export async function toggleSourceActive(
  input: ToggleSourceActiveInput
): Promise<ActionResult<ContentSourceSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to toggle a content source')
    }

    // Validate input
    const validated = validateData(input, toggleSourceActiveSchema)
    if (!validated.success) return validated

    // Check if source exists and belongs to user
    const existingSource = await db.query.contentSources.findFirst({
      where: and(
        eq(contentSources.id, validated.data.id),
        eq(contentSources.userId, user.id)
      ),
    })

    if (!existingSource) {
      return failure('Content source not found')
    }

    // Update active status
    await db
      .update(contentSources)
      .set({
        isActive: validated.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(contentSources.id, validated.data.id))

    revalidatePath('/dashboard')

    return success({
      message: validated.data.isActive
        ? 'Content source activated'
        : 'Content source deactivated',
      sourceId: validated.data.id,
    })
  } catch (error) {
    console.error('Toggle source active error:', error)
    return failure('Failed to toggle content source. Please try again.')
  }
}

/**
 * Server Action: Delete Content Source
 * Deletes a content source
 */
export async function deleteContentSource(
  input: DeleteSourceInput
): Promise<ActionResult<ContentSourceSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to delete a content source')
    }

    // Validate input
    const validated = validateData(input, deleteSourceSchema)
    if (!validated.success) return validated

    // Check if source exists and belongs to user
    const existingSource = await db.query.contentSources.findFirst({
      where: and(
        eq(contentSources.id, validated.data.id),
        eq(contentSources.userId, user.id)
      ),
    })

    if (!existingSource) {
      return failure('Content source not found')
    }

    // Delete content source
    await db
      .delete(contentSources)
      .where(eq(contentSources.id, validated.data.id))

    revalidatePath('/dashboard')

    return success({
      message: 'Content source deleted successfully',
    })
  } catch (error) {
    console.error('Delete content source error:', error)
    return failure('Failed to delete content source. Please try again.')
  }
}

/**
 * Server Action: Get User Content Sources
 * Retrieves all content sources for the authenticated user
 */
export async function getUserContentSources() {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    // Fetch sources
    const sources = await db.query.contentSources.findMany({
      where: eq(contentSources.userId, user.id),
      orderBy: [desc(contentSources.createdAt)],
    })

    return sources
  } catch (error) {
    console.error('Get user content sources error:', error)
    return []
  }
}

