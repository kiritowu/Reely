import { z } from 'zod'

/**
 * Content Sources Types and Schemas
 */

// Source type enum
export const SOURCE_TYPES = [
  'url',
  'rss_feed',
  'youtube_channel',
  'youtube_playlist',
  'twitter_user',
  'reddit_subreddit',
  'podcast_rss',
  'api_endpoint',
  'github_repo',
] as const

export type SourceType = typeof SOURCE_TYPES[number]

// Source type labels for UI
export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  url: 'Website URL',
  rss_feed: 'RSS Feed',
  youtube_channel: 'YouTube Channel',
  youtube_playlist: 'YouTube Playlist',
  twitter_user: 'Twitter/X User',
  reddit_subreddit: 'Reddit Subreddit',
  podcast_rss: 'Podcast RSS',
  api_endpoint: 'API Endpoint',
  github_repo: 'GitHub Repository',
}

// Category enum (matching your video categories)
export const CATEGORIES = [
  'all',
  'tech',
  'politics',
  'science',
  'business',
  'sports',
  'entertainment',
  'health',
] as const

export type Category = typeof CATEGORIES[number]

// Category labels for UI
export const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All Categories',
  tech: 'Technology',
  politics: 'Politics',
  science: 'Science',
  business: 'Business',
  sports: 'Sports',
  entertainment: 'Entertainment',
  health: 'Health',
}

// Scrape frequency enum
export const SCRAPE_FREQUENCIES = [
  'realtime',
  'hourly',
  'daily',
  'weekly',
] as const

export type ScrapeFrequency = typeof SCRAPE_FREQUENCIES[number]

// Scrape frequency labels for UI
export const SCRAPE_FREQUENCY_LABELS: Record<ScrapeFrequency, string> = {
  realtime: 'Real-time',
  hourly: 'Every Hour',
  daily: 'Daily',
  weekly: 'Weekly',
}

// Create content source schema
export const createContentSourceSchema = z.object({
  sourceType: z.enum(SOURCE_TYPES, {
    message: 'Please select a source type',
  }),
  sourceUrl: z
    .string()
    .min(1, 'Source URL is required')
    .url('Please enter a valid URL'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .default(''),
  category: z.enum(CATEGORIES).default('all'),
  scrapeFrequency: z.enum(SCRAPE_FREQUENCIES).default('daily'),
  isActive: z.boolean().default(true),
})

// Form schema without defaults (for React Hook Form)
export const createContentSourceFormSchema = z.object({
  sourceType: z.enum(SOURCE_TYPES, {
    message: 'Please select a source type',
  }),
  sourceUrl: z
    .string()
    .min(1, 'Source URL is required')
    .url('Please enter a valid URL'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters'),
  category: z.enum(CATEGORIES),
  scrapeFrequency: z.enum(SCRAPE_FREQUENCIES),
  isActive: z.boolean(),
})

// Update content source schema (all fields optional except ID)
export const updateContentSourceSchema = z.object({
  id: z.string().uuid(),
  sourceType: z.enum(SOURCE_TYPES).optional(),
  sourceUrl: z.string().url('Please enter a valid URL').optional(),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.enum(CATEGORIES).optional(),
  scrapeFrequency: z.enum(SCRAPE_FREQUENCIES).optional(),
  isActive: z.boolean().optional(),
})

// Toggle active status schema
export const toggleSourceActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
})

// Delete source schema
export const deleteSourceSchema = z.object({
  id: z.string().uuid(),
})

// Infer TypeScript types
export type CreateContentSourceInput = z.infer<typeof createContentSourceSchema>
export type CreateContentSourceFormData = z.infer<typeof createContentSourceFormSchema>
export type UpdateContentSourceInput = z.infer<typeof updateContentSourceSchema>
export type ToggleSourceActiveInput = z.infer<typeof toggleSourceActiveSchema>
export type DeleteSourceInput = z.infer<typeof deleteSourceSchema>

// Server action success types
export type ContentSourceSuccess = {
  message: string
  sourceId?: string
}

