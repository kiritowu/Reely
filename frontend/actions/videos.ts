'use server'

import { db } from '@/lib/db'
import { videos } from '@/db/schema'
import { success, failure, validateData, type ActionResult } from '@/lib/action-result'
import {
  createVideoSchema,
  updateVideoSchema,
  toggleVideoPublishedSchema,
  deleteVideoSchema,
  incrementViewCountSchema,
  getVideosQuerySchema,
  type CreateVideoInput,
  type UpdateVideoInput,
  type ToggleVideoPublishedInput,
  type DeleteVideoInput,
  type IncrementViewCountInput,
  type GetVideosQuery,
  type VideoSuccess,
} from '@/types/videos'
import { getCurrentUser } from './auth'
import { eq, and, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: Create Video
 * Creates a new video for the authenticated user
 */
export async function createVideo(
  input: CreateVideoInput
): Promise<ActionResult<VideoSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to create a video')
    }

    // Validate input
    const validated = validateData(input, createVideoSchema)
    if (!validated.success) return validated

    // Create video
    const [video] = await db
      .insert(videos)
      .values({
        userId: user.id,
        videoName: validated.data.videoName,
        title: validated.data.title,
        description: validated.data.description || null,
        thumbnail: validated.data.thumbnail || null,
        category: validated.data.category,
        sourceId: validated.data.sourceId || null,
        sourceName: validated.data.sourceName || null,
        sourceUrl: validated.data.sourceUrl || null,
        duration: validated.data.duration || null,
        slides: validated.data.slides || null,
        isPublished: validated.data.isPublished,
        publishedAt: validated.data.isPublished ? new Date() : null,
      })
      .returning()

    revalidatePath('/app')
    revalidatePath('/dashboard')

    return success({
      message: 'Video created successfully',
      videoId: video.id,
    })
  } catch (error) {
    console.error('Create video error:', error)
    return failure('Failed to create video. Please try again.')
  }
}

/**
 * Server Action: Update Video
 * Updates an existing video
 */
export async function updateVideo(
  input: UpdateVideoInput
): Promise<ActionResult<VideoSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to update a video')
    }

    // Validate input
    const validated = validateData(input, updateVideoSchema)
    if (!validated.success) return validated

    // Check if video exists and belongs to user
    const existingVideo = await db.query.videos.findFirst({
      where: and(
        eq(videos.id, validated.data.id),
        eq(videos.userId, user.id)
      ),
    })

    if (!existingVideo) {
      return failure('Video not found')
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (validated.data.videoName !== undefined) updateData.videoName = validated.data.videoName
    if (validated.data.title !== undefined) updateData.title = validated.data.title
    if (validated.data.description !== undefined) updateData.description = validated.data.description
    if (validated.data.thumbnail !== undefined) updateData.thumbnail = validated.data.thumbnail
    if (validated.data.category !== undefined) updateData.category = validated.data.category
    if (validated.data.sourceId !== undefined) updateData.sourceId = validated.data.sourceId
    if (validated.data.sourceName !== undefined) updateData.sourceName = validated.data.sourceName
    if (validated.data.sourceUrl !== undefined) updateData.sourceUrl = validated.data.sourceUrl
    if (validated.data.duration !== undefined) updateData.duration = validated.data.duration
    if (validated.data.slides !== undefined) updateData.slides = validated.data.slides
    
    // Handle publishing status
    if (validated.data.isPublished !== undefined) {
      updateData.isPublished = validated.data.isPublished
      // Set publishedAt when publishing for the first time
      if (validated.data.isPublished && !existingVideo.publishedAt) {
        updateData.publishedAt = new Date()
      }
      // Clear publishedAt when unpublishing
      if (!validated.data.isPublished) {
        updateData.publishedAt = null
      }
    }

    await db
      .update(videos)
      .set(updateData)
      .where(eq(videos.id, validated.data.id))

    revalidatePath('/app')
    revalidatePath('/dashboard')

    return success({
      message: 'Video updated successfully',
      videoId: validated.data.id,
    })
  } catch (error) {
    console.error('Update video error:', error)
    return failure('Failed to update video. Please try again.')
  }
}

/**
 * Server Action: Toggle Video Published Status
 * Publishes or unpublishes a video
 */
export async function toggleVideoPublished(
  input: ToggleVideoPublishedInput
): Promise<ActionResult<VideoSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to toggle video status')
    }

    // Validate input
    const validated = validateData(input, toggleVideoPublishedSchema)
    if (!validated.success) return validated

    // Check if video exists and belongs to user
    const existingVideo = await db.query.videos.findFirst({
      where: and(
        eq(videos.id, validated.data.id),
        eq(videos.userId, user.id)
      ),
    })

    if (!existingVideo) {
      return failure('Video not found')
    }

    // Update published status
    await db
      .update(videos)
      .set({
        isPublished: validated.data.isPublished,
        publishedAt: validated.data.isPublished 
          ? (existingVideo.publishedAt || new Date()) 
          : null,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, validated.data.id))

    revalidatePath('/app')
    revalidatePath('/dashboard')

    return success({
      message: validated.data.isPublished
        ? 'Video published successfully'
        : 'Video unpublished successfully',
      videoId: validated.data.id,
    })
  } catch (error) {
    console.error('Toggle video published error:', error)
    return failure('Failed to toggle video status. Please try again.')
  }
}

/**
 * Server Action: Delete Video
 * Deletes a video
 */
export async function deleteVideo(
  input: DeleteVideoInput
): Promise<ActionResult<VideoSuccess>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return failure('You must be signed in to delete a video')
    }

    // Validate input
    const validated = validateData(input, deleteVideoSchema)
    if (!validated.success) return validated

    // Check if video exists and belongs to user
    const existingVideo = await db.query.videos.findFirst({
      where: and(
        eq(videos.id, validated.data.id),
        eq(videos.userId, user.id)
      ),
    })

    if (!existingVideo) {
      return failure('Video not found')
    }

    // Delete video
    await db
      .delete(videos)
      .where(eq(videos.id, validated.data.id))

    revalidatePath('/app')
    revalidatePath('/dashboard')

    return success({
      message: 'Video deleted successfully',
    })
  } catch (error) {
    console.error('Delete video error:', error)
    return failure('Failed to delete video. Please try again.')
  }
}

/**
 * Server Action: Increment View Count
 * Increments the view count for a video (no auth required)
 */
export async function incrementViewCount(
  input: IncrementViewCountInput
): Promise<ActionResult<VideoSuccess>> {
  try {
    // Validate input
    const validated = validateData(input, incrementViewCountSchema)
    if (!validated.success) return validated

    // Check if video exists
    const existingVideo = await db.query.videos.findFirst({
      where: eq(videos.id, validated.data.id),
    })

    if (!existingVideo) {
      return failure('Video not found')
    }

    // Increment view count
    await db
      .update(videos)
      .set({
        viewCount: sql`${videos.viewCount} + 1`,
      })
      .where(eq(videos.id, validated.data.id))

    return success({
      message: 'View count incremented',
      videoId: validated.data.id,
    })
  } catch (error) {
    console.error('Increment view count error:', error)
    return failure('Failed to increment view count.')
  }
}

/**
 * Server Action: Get User Videos
 * Retrieves all videos for the authenticated user with optional filters
 */
export async function getUserVideos(query?: GetVideosQuery) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    // Validate query
    let validatedQuery: GetVideosQuery = {}
    if (query) {
      const validated = validateData(query, getVideosQuerySchema)
      if (!validated.success) return []
      validatedQuery = validated.data
    }

    // Build where conditions
    const conditions = [eq(videos.userId, user.id)]

    if (validatedQuery.category && validatedQuery.category !== 'all') {
      conditions.push(eq(videos.category, validatedQuery.category))
    }

    if (validatedQuery.isPublished !== undefined) {
      conditions.push(eq(videos.isPublished, validatedQuery.isPublished))
    }

    if (validatedQuery.sourceId) {
      conditions.push(eq(videos.sourceId, validatedQuery.sourceId))
    }

    // Fetch videos
    const userVideos = await db.query.videos.findMany({
      where: and(...conditions),
      orderBy: [desc(videos.createdAt)],
      limit: validatedQuery.limit || 50,
      offset: validatedQuery.offset || 0,
    })

    return userVideos
  } catch (error) {
    console.error('Get user videos error:', error)
    return []
  }
}

/**
 * Server Action: Get Published Videos
 * Retrieves all published videos (no auth required) with optional filters
 */
export async function getPublishedVideos(query?: GetVideosQuery) {
  try {
    // Validate query
    let validatedQuery: GetVideosQuery = {}
    if (query) {
      const validated = validateData(query, getVideosQuerySchema)
      if (!validated.success) return []
      validatedQuery = validated.data
    }

    // Build where conditions
    const conditions = [eq(videos.isPublished, true)]

    if (validatedQuery.category && validatedQuery.category !== 'all') {
      conditions.push(eq(videos.category, validatedQuery.category))
    }

    if (validatedQuery.sourceId) {
      conditions.push(eq(videos.sourceId, validatedQuery.sourceId))
    }

    // Fetch published videos
    const publishedVideos = await db.query.videos.findMany({
      where: and(...conditions),
      orderBy: [desc(videos.createdAt)],
      limit: validatedQuery.limit || 50,
      offset: validatedQuery.offset || 0,
    })

    return publishedVideos
  } catch (error) {
    console.error('Get published videos error:', error)
    return []
  }
}

/**
 * Server Action: Get Video by ID
 * Retrieves a single video by ID
 */
export async function getVideoById(id: string) {
  try {
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, id),
    })

    return video || null
  } catch (error) {
    console.error('Get video by ID error:', error)
    return null
  }
}

