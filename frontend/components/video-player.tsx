'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Heart, ThumbsDown, Play, Pause, Volume2, VolumeX, Zap, TrendingUp, FlaskConical, Briefcase, Trophy, Clapperboard, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { SlideDotsIndicator } from '@/components/slide-dots-indicator'
import { SlideContent } from '@/components/slide-content'
import type { Video } from '@/lib/videos'
import { incrementViewCount } from '@/actions/videos'

interface VideoPlayerProps {
  video: Video
  isActive: boolean
  onSlideChange?: (slideIndex: number) => void
}

export interface VideoPlayerHandle {
  scrollToSlide: (direction: 'left' | 'right') => void
}

// Helper function for category icons
function getCategoryIcon(category: string) {
  const icons: Record<string, typeof Zap> = {
    tech: Zap,
    politics: TrendingUp,
    science: FlaskConical,
    business: Briefcase,
    sports: Trophy,
    entertainment: Clapperboard,
    health: HeartPulse,
  }
  return icons[category] || Zap
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ video, isActive, onSlideChange }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const slidesContainerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true) // Will be updated from localStorage
    const [liked, setLiked] = useState(false)
    const [disliked, setDisliked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [showPlayIcon, setShowPlayIcon] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [viewCounted, setViewCounted] = useState(false)

    const { ref: observerRef, entry } = useIntersectionObserver({
      threshold: 0.7,
    })

    // Track view count when video becomes active
    useEffect(() => {
      // Only count view once per video and if it's a valid UUID (not a repeated video with -repeat suffix)
      if (isActive && !viewCounted && entry?.isIntersecting && !video.id.includes('-repeat')) {
        setViewCounted(true)
        // Increment view count in background (don't await, fire and forget)
        incrementViewCount({ id: video.id }).catch(console.error)
      }
    }, [isActive, viewCounted, entry?.isIntersecting, video.id])

    // Expose scrollToSlide method to parent via ref
    useImperativeHandle(ref, () => ({
      scrollToSlide: (direction: 'left' | 'right') => {
        const container = slidesContainerRef.current
        if (!container) return

        const slideWidth = container.clientWidth
        const totalSlides = video.slides.length + 1 // +1 for the video slide
        
        if (direction === 'right') {
          // If on last slide, go back to first slide (video)
          if (currentSlide === totalSlides - 1) {
            container.scrollTo({ left: 0, behavior: 'smooth' })
          } else {
            container.scrollBy({ left: slideWidth, behavior: 'smooth' })
          }
        } else {
          // If on first slide (video), go to last slide
          if (currentSlide === 0) {
            container.scrollTo({ left: slideWidth * (totalSlides - 1), behavior: 'smooth' })
          } else {
            container.scrollBy({ left: -slideWidth, behavior: 'smooth' })
          }
        }
      },
    }))

    // Initialize like count and mute preference on client only to avoid hydration mismatch
    useEffect(() => {
      setIsClient(true)
      // Generate deterministic like count based on video id
      const seed = video.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const randomLikes = (seed * 9876543) % 10000 + 1000
      setLikeCount(randomLikes)
      
      // Load mute preference from localStorage
      const savedMutePreference = localStorage.getItem('videoMuted')
      if (savedMutePreference !== null) {
        setIsMuted(savedMutePreference === 'true')
      }
    }, [video.id])

    // Reset to first slide when video becomes active
    useEffect(() => {
      if (isActive && slidesContainerRef.current) {
        slidesContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        setCurrentSlide(0)
      }
    }, [isActive])

    // Track current slide on horizontal scroll
    useEffect(() => {
      const container = slidesContainerRef.current
      if (!container) return

      const handleScroll = () => {
        const scrollLeft = container.scrollLeft
        const slideWidth = container.clientWidth
        const index = Math.round(scrollLeft / slideWidth)
        setCurrentSlide(index)
        onSlideChange?.(index)
      }

      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }, [onSlideChange])

    // Auto-play/pause based on viewport visibility and slide position
    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      // Only play video when on first slide (the video slide)
      if (entry?.isIntersecting && currentSlide === 0) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error('Auto-play failed:', error)
            setIsPlaying(false)
          })
      } else {
        video.pause()
        setIsPlaying(false)
      }
    }, [entry?.isIntersecting, currentSlide])

    const togglePlayPause = () => {
      const video = videoRef.current
      if (!video) return

      if (video.paused) {
        video.play()
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }

      // Show play/pause icon briefly
      setShowPlayIcon(true)
      setTimeout(() => setShowPlayIcon(false), 500)
    }

    const toggleMute = () => {
      const video = videoRef.current
      if (!video) return

      const newMutedState = !video.muted
      video.muted = newMutedState
      setIsMuted(newMutedState)
      
      // Save preference to localStorage so all videos use the same setting
      localStorage.setItem('videoMuted', String(newMutedState))
    }

    const handleLike = () => {
      if (liked) {
        setLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        setLiked(true)
        setLikeCount((prev) => prev + 1)
        if (disliked) {
          setDisliked(false)
        }
      }
    }

    const handleDislike = () => {
      if (disliked) {
        setDisliked(false)
      } else {
        setDisliked(true)
        if (liked) {
          setLiked(false)
          setLikeCount((prev) => prev - 1)
        }
      }
    }

    return (
      <div
        ref={observerRef as React.RefObject<HTMLDivElement>}
        className="relative h-full w-full min-h-full snap-start snap-always bg-black"
      >
        {/* Horizontal Slides Container */}
        <div
          ref={slidesContainerRef}
          className="flex h-full w-full overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
        >
          {/* Video Slide (First Slide) */}
          <div className="relative h-full w-full min-w-full snap-start snap-always flex-shrink-0">
            {/* Video Element */}
            <video
              ref={videoRef}
              src={video.src}
              loop
              playsInline
              muted={isMuted}
              className="h-full w-full object-cover"
              onClick={togglePlayPause}
            />

            {/* Play/Pause Icon Overlay */}
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300',
                showPlayIcon ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="rounded-full bg-black/50 p-8">
                {isPlaying ? (
                  <Pause className="h-16 w-16 text-white" fill="white" />
                ) : (
                  <Play className="h-16 w-16 text-white" fill="white" />
                )}
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="absolute bottom-36 right-4 z-20 flex flex-col gap-6">
              {/* Like Button */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  size="icon-lg"
                  variant="ghost"
                  onClick={handleLike}
                  className={cn(
                    'rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40',
                    liked && 'text-red-500'
                  )}
                >
                  <Heart
                    className="h-7 w-7"
                    fill={liked ? 'currentColor' : 'none'}
                    strokeWidth={2}
                  />
                </Button>
                {isClient && (
                  <span className="text-xs font-semibold text-white drop-shadow-lg">
                    {likeCount.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Dislike Button */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  size="icon-lg"
                  variant="ghost"
                  onClick={handleDislike}
                  className={cn(
                    'rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40',
                    disliked && 'text-blue-500'
                  )}
                >
                  <ThumbsDown
                    className="h-7 w-7"
                    fill={disliked ? 'currentColor' : 'none'}
                    strokeWidth={2}
                  />
                </Button>
                <span className="text-xs font-semibold text-white drop-shadow-lg">
                  Dislike
                </span>
              </div>

              {/* Mute/Unmute Button */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  size="icon-lg"
                  variant="ghost"
                  onClick={toggleMute}
                  className="rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40"
                >
                  {isMuted ? (
                    <VolumeX className="h-7 w-7 text-white" strokeWidth={2} />
                  ) : (
                    <Volume2 className="h-7 w-7 text-white" strokeWidth={2} />
                  )}
                </Button>
              </div>
            </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-0 pt-24">
            <div className="max-w-md pb-6 space-y-2.5">
              {/* Category, Source & Timestamp Row */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/20">
                  {(() => {
                    const Icon = getCategoryIcon(video.category)
                    return <Icon className="h-3 w-3 text-white/80" />
                  })()}
                  <span className="text-white/90 font-medium capitalize">
                    {video.category}
                  </span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-white/70 font-medium">{video.source}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{video.timestamp}</span>
              </div>

              {/* Title - with auto-scroll for long text */}
              <div className="overflow-hidden max-w-full">
                <div className="flex animate-marquee-slow items-center">
                  <h2 className="text-lg font-bold text-white drop-shadow-lg leading-tight whitespace-nowrap shrink-0">
                    {video.title}
                  </h2>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mx-6" />
                  <h2 className="text-lg font-bold text-white drop-shadow-lg leading-tight whitespace-nowrap shrink-0">
                    {video.title}
                  </h2>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mx-6" />
                  <h2 className="text-lg font-bold text-white drop-shadow-lg leading-tight whitespace-nowrap shrink-0">
                    {video.title}
                  </h2>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mx-6" />
                  <h2 className="text-lg font-bold text-white drop-shadow-lg leading-tight whitespace-nowrap shrink-0">
                    {video.title}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/80 drop-shadow-md leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>

            {/* Top Gradient for better visibility */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-32 bg-gradient-to-b from-black/30 to-transparent" />
          </div>

          {/* Additional Slides */}
          {video.slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full w-full min-w-full snap-start snap-always flex-shrink-0 bg-neutral-900"
            >
              <SlideContent slide={slide} />
            </div>
          ))}
        </div>

      {/* Slide Dots Indicator - Only show if there are slides and not on video slide */}
      {video.slides.length > 0 && currentSlide !== 0 && (
        <div className="absolute left-0 right-0 bottom-8 z-30 flex justify-center">
          <div className="rounded-full bg-black/30 px-4 py-2 backdrop-blur-sm">
            <SlideDotsIndicator total={video.slides.length + 1} current={currentSlide} />
          </div>
        </div>
      )}
      </div>
    )
  }
)
