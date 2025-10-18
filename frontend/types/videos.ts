import { z } from 'zod'
import type { Slide } from '@/lib/slide-types'

/**
 * Video Types and Schemas
 */

// Category enum (matching your video categories)
export const VIDEO_CATEGORIES = [
  'all',
  'tech',
  'politics',
  'science',
  'business',
  'sports',
  'entertainment',
  'health',
] as const

export type VideoCategory = typeof VIDEO_CATEGORIES[number]

// Category labels for UI
export const VIDEO_CATEGORY_LABELS: Record<VideoCategory, string> = {
  all: 'All Categories',
  tech: 'Technology',
  politics: 'Politics',
  science: 'Science',
  business: 'Business',
  sports: 'Sports',
  entertainment: 'Entertainment',
  health: 'Health',
}

// Create video schema
export const createVideoSchema = z.object({
  videoName: z
    .string()
    .min(1, 'Video name is required')
    .max(255, 'Video name must be less than 255 characters'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  thumbnail: z.string().url('Please enter a valid thumbnail URL').optional(),
  category: z.enum(VIDEO_CATEGORIES).default('all'),
  sourceId: z.string().uuid().optional(), // Link to content source
  sourceName: z.string().max(100).optional(),
  sourceUrl: z.string().url('Please enter a valid source URL').optional(),
  duration: z.number().int().positive().optional(),
  slides: z.custom<Slide[]>().optional(),
  isPublished: z.boolean().default(false),
})

// Update video schema (all fields optional except ID)
export const updateVideoSchema = z.object({
  id: z.string().uuid(),
  videoName: z
    .string()
    .min(1, 'Video name is required')
    .max(255, 'Video name must be less than 255 characters')
    .optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  thumbnail: z.string().url('Please enter a valid thumbnail URL').optional(),
  category: z.enum(VIDEO_CATEGORIES).optional(),
  sourceId: z.string().uuid().nullable().optional(), // Allow null to unlink
  sourceName: z.string().max(100).optional(),
  sourceUrl: z.string().url('Please enter a valid source URL').optional(),
  duration: z.number().int().positive().optional(),
  slides: z.custom<Slide[]>().optional(),
  isPublished: z.boolean().optional(),
})

// Toggle published status schema
export const toggleVideoPublishedSchema = z.object({
  id: z.string().uuid(),
  isPublished: z.boolean(),
})

// Delete video schema
export const deleteVideoSchema = z.object({
  id: z.string().uuid(),
})

// Increment view count schema
export const incrementViewCountSchema = z.object({
  id: z.string().uuid(),
})

// Get videos query schema
export const getVideosQuerySchema = z.object({
  category: z.enum(VIDEO_CATEGORIES).optional(),
  isPublished: z.boolean().optional(),
  sourceId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

// Infer TypeScript types
export type CreateVideoInput = z.infer<typeof createVideoSchema>
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>
export type ToggleVideoPublishedInput = z.infer<typeof toggleVideoPublishedSchema>
export type DeleteVideoInput = z.infer<typeof deleteVideoSchema>
export type IncrementViewCountInput = z.infer<typeof incrementViewCountSchema>
export type GetVideosQuery = z.infer<typeof getVideosQuerySchema>

// Server action success types
export type VideoSuccess = {
  message: string
  videoId?: string
}

