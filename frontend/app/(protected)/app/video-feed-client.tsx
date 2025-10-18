'use client'

import { VideoPlayer, type VideoPlayerHandle } from '@/components/video-player'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Video } from '@/lib/videos'
import { getLandingVideoUrl } from '@/lib/supabase/storage'

interface VideoFeedClientProps {
  videos: Video[]
}

export function VideoFeedClient({ videos }: VideoFeedClientProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const videoPlayerRefs = useRef<(VideoPlayerHandle | null)[]>([])
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const landingVideoUrl = getLandingVideoUrl()

  // Track which video is currently active
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const videoHeight = container.clientHeight
      const index = Math.round(scrollTop / videoHeight)
      setActiveVideoIndex(index)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Centralized keyboard handler for all navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle left/right arrows for slide navigation (works globally)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const activePlayer = videoPlayerRefs.current[activeVideoIndex]
        if (activePlayer) {
          activePlayer.scrollToSlide(e.key === 'ArrowLeft' ? 'left' : 'right')
        }
        return
      }

      // Handle vertical navigation (up/down) - only when on the first slide (video)
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // If user is on a slide (not the video), don't allow vertical navigation
        if (currentSlideIndex !== 0) {
          e.preventDefault()
          return
        }

        e.preventDefault()
        const container = scrollContainerRef.current
        if (!container) return

        const scrollAmount = container.clientHeight
        if (e.key === 'ArrowDown') {
          container.scrollBy({ top: scrollAmount, behavior: 'smooth' })
        } else {
          container.scrollBy({ top: -scrollAmount, behavior: 'smooth' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlideIndex, activeVideoIndex])

  const handleSlideChange = (slideIndex: number) => {
    setCurrentSlideIndex(slideIndex)
  }

  // Show empty state if no videos
  if (videos.length === 0) {
    return (
      <div className="relative h-screen w-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">No videos available</h2>
          <p className="text-muted-foreground">Check back later for new content!</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen bg-black flex items-center justify-center p-0 md:p-2 overflow-hidden">
      {/* Background Video - Only visible on desktop outside the video window */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover hidden md:block"
      >
        <source src={landingVideoUrl} type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-muted/[0.99] hidden md:block" />

      {/* Back Button - Fixed to screen top left */}
      <Button 
        asChild
        size="icon"
        className="absolute top-4 left-4 z-50 rounded-full shadow-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm"
      >
        <Link href="/dashboard">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
      </Button>

      {/* Rounded Window Container - Desktop only, Full screen on mobile */}
      <div className="relative h-full w-full md:h-[96vh] md:max-h-[880px] md:w-full md:max-w-[480px] md:rounded-2xl md:shadow-2xl overflow-hidden bg-black z-10">
        {/* Video Feed - Scrolls within the window */}
        <div 
          ref={scrollContainerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{
            // Disable vertical scroll when not on first slide
            overflowY: currentSlideIndex === 0 ? 'scroll' : 'hidden'
          }}
        >
          {videos.map((video, index) => (
            <VideoPlayer 
              key={`${video.id}-${index}`} 
              video={video}
              isActive={index === activeVideoIndex}
              onSlideChange={handleSlideChange}
              ref={(el: VideoPlayerHandle | null) => {
                videoPlayerRefs.current[index] = el
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

