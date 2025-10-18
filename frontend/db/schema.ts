import { pgTable, text, timestamp, uuid, foreignKey, boolean, jsonb, index, integer } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import type { Slide } from '@/lib/slide-types'

/**
 * Profiles table - simplified copy of auth.users for easier linking
 * Linked to Supabase auth.users via user_id
 * Uses Drizzle's built-in Supabase auth table reference
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [authUsers.id],
    name: 'profiles_user_id_fk',
  }).onDelete('cascade'),
])

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

/**
 * Content Sources table
 * Stores user-subscribed content sources (URLs, RSS feeds, social media, etc.)
 * These are the sources that the scraper service will poll for new content
 */
export const contentSources = pgTable('content_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.userId, { onDelete: 'cascade' }),
  
  // Source details
  sourceType: text('source_type', {
    enum: [
      'url',
      'rss_feed',
      'youtube_channel',
      'youtube_playlist',
      'twitter_user',
      'reddit_subreddit',
      'podcast_rss',
      'api_endpoint',
      'github_repo',
    ]
  }).notNull(),
  
  sourceUrl: text('source_url').notNull(), // The actual URL/identifier to scrape
  displayName: text('display_name').notNull(), // User-friendly name
  description: text('description'), // Optional description
  
  // Categorization (matching your video categories)
  category: text('category', {
    enum: ['tech', 'politics', 'science', 'business', 'sports', 'entertainment', 'health', 'all']
  }).notNull().default('all'),
  
  // Scraping configuration
  isActive: boolean('is_active').notNull().default(true), // Can be toggled on/off
  scrapeFrequency: text('scrape_frequency', {
    enum: ['realtime', 'hourly', 'daily', 'weekly'] // How often to check for new content
  }).notNull().default('daily'),
  
  // Metadata - flexible field for source-specific configuration
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  // Scraping status tracking
  lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
  lastSuccessfulScrapeAt: timestamp('last_successful_scrape_at', { withTimezone: true }),
  scrapeErrorCount: integer('scrape_error_count').notNull().default(0),
  lastError: text('last_error'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('content_sources_user_id_idx').on(table.userId),
  index('content_sources_source_type_idx').on(table.sourceType),
  index('content_sources_category_idx').on(table.category),
  index('content_sources_is_active_idx').on(table.isActive),
])

export type ContentSource = typeof contentSources.$inferSelect
export type NewContentSource = typeof contentSources.$inferInsert

/**
 * Videos table
 * Stores user-generated or scraped video content with associated metadata
 * Videos can be linked to content sources they were scraped from
 */
export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.userId, { onDelete: 'cascade' }),
  
  // Core video info
  videoName: text('video_name').notNull(), // e.g., "video-1.mp4" or full path/URL
  title: text('title').notNull(),
  description: text('description'),
  thumbnail: text('thumbnail'),
  
  // Categorization (matching your video categories)
  category: text('category', {
    enum: ['tech', 'politics', 'science', 'business', 'sports', 'entertainment', 'health', 'all']
  }).notNull().default('all'),
  
  // Source tracking (where did this video come from?)
  sourceId: uuid('source_id')
    .references(() => contentSources.id, { onDelete: 'set null' }), // Optional link to content source
  sourceName: text('source_name'), // e.g., "TechCrunch", "BBC News"
  sourceUrl: text('source_url'), // Original article/content URL
  
  // Video metadata
  duration: integer('duration'), // in seconds
  viewCount: integer('view_count').notNull().default(0),
  
  // Slides as JSONB (flexible storage for complex nested slide data)
  slides: jsonb('slides').$type<Slide[]>(),
  
  // Publishing
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('videos_user_id_idx').on(table.userId),
  index('videos_category_idx').on(table.category),
  index('videos_source_id_idx').on(table.sourceId),
  index('videos_is_published_idx').on(table.isPublished),
  index('videos_created_at_idx').on(table.createdAt),
])

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert

