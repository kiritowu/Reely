import { createClient as createBrowserClient } from '@/lib/supabase/client'

/**
 * Supabase Storage utilities for video management
 */

export const STORAGE_BUCKET = 'videos' as const

/**
 * Get the landing page video URL from Supabase Storage
 * This is a convenience function for the static landing video
 */
export function getLandingVideoUrl(): string {
  return getVideoPublicUrlDirect('landing.mp4')
}

/**
 * Get public URL for a video using Supabase client
 * This is the recommended approach when using the Supabase SDK
 */
export function getVideoPublicUrl(videoName: string): string {
  const supabase = createBrowserClient()
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(videoName)
  
  return data.publicUrl
}

/**
 * Get public URL without initializing Supabase client
 * Useful for server-side rendering and static generation
 */
export function getVideoPublicUrlDirect(videoName: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    return `/videos/${videoName}` // Fallback to local path
  }
  
  // Construct the public URL for Supabase Storage
  // Format: https://{project_id}.supabase.co/storage/v1/object/public/{bucket}/{file-path}
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${videoName}`
}

/**
 * Create a signed URL for temporary access to a video
 * Useful for private videos or temporary access control
 * @param videoName - The video filename
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function createSignedVideoUrl(
  videoName: string, 
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(videoName, expiresIn)
  
  if (error) {
    console.error('Failed to create signed URL:', error)
    return null
  }
  
  return data.signedUrl
}

/**
 * Upload a video file to Supabase Storage
 * @param file - The video file to upload
 * @param filename - The desired filename (optional, will use file.name if not provided)
 * @param options - Upload options
 */
export async function uploadVideo(
  file: File,
  filename?: string,
  options?: {
    cacheControl?: string
    upsert?: boolean
  }
) {
  const supabase = createBrowserClient()
  const videoFilename = filename || file.name
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(videoFilename, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    })
  
  if (error) {
    console.error('Failed to upload video:', error)
    return { data: null, error }
  }
  
  // Get the public URL of the uploaded video
  const publicUrl = getVideoPublicUrl(videoFilename)
  
  return { 
    data: { 
      ...data, 
      publicUrl 
    }, 
    error: null 
  }
}

/**
 * Delete a video from Supabase Storage
 * @param videoName - The video filename to delete
 */
export async function deleteVideo(videoName: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([videoName])
  
  if (error) {
    console.error('Failed to delete video:', error)
    return { data: null, error }
  }
  
  return { data, error: null }
}

/**
 * List all videos in the storage bucket
 * @param path - Optional path within the bucket to list
 */
export async function listVideos(path?: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(path, {
      sortBy: { column: 'created_at', order: 'desc' },
    })
  
  if (error) {
    console.error('Failed to list videos:', error)
    return { data: null, error }
  }
  
  return { data, error: null }
}

