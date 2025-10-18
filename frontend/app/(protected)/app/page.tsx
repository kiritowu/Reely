import { VideoFeedClient } from './video-feed-client'
import { getPublishedVideos } from '@/actions/videos'
import { transformDBVideoToUI, createInfiniteVideos } from '@/lib/video-utils'

export default async function VideoFeedPage() {
  // Fetch published videos from database
  const dbVideos = await getPublishedVideos({ limit: 50 })
  
  // Transform to UI format and create infinite scroll
  const videos = dbVideos.map(transformDBVideoToUI)
  const infiniteVideos = createInfiniteVideos(videos, 5)

  return <VideoFeedClient videos={infiniteVideos} />
}
