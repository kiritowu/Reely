import type { Video as DBVideo } from '@/db/schema'
import type { Video as UIVideo } from '@/lib/videos'
import { getVideoPublicUrlDirect } from '@/lib/supabase/storage'

/**
 * Transform database video to UI video format
 * Handles the conversion between database schema and UI expectations
 */
export function transformDBVideoToUI(dbVideo: DBVideo): UIVideo {
  return {
    id: dbVideo.id,
    src: getVideoPublicUrlDirect(dbVideo.videoName), // Use Supabase Storage URL
    title: dbVideo.title,
    description: dbVideo.description || '',
    category: dbVideo.category === 'all' ? 'tech' : dbVideo.category as UIVideo['category'],
    source: dbVideo.sourceName || 'Unknown Source',
    timestamp: formatTimestamp(dbVideo.createdAt),
    thumbnail: dbVideo.thumbnail || undefined,
    slides: dbVideo.slides || [],
  }
}

/**
 * Format timestamp to relative time (e.g., "5 hours ago", "2 days ago")
 */
function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`
}

/**
 * Create infinite loop of videos for smooth scrolling
 */
export function createInfiniteVideos(videos: UIVideo[], repeatCount: number = 3): UIVideo[] {
  if (videos.length === 0) return []
  
  return Array.from({ length: repeatCount }, (_, i) =>
    videos.map((video) => ({
      ...video,
      id: `${video.id}-repeat-${i}`,
    }))
  ).flat()
}

