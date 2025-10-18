import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Zap, Sparkles } from 'lucide-react'
import { getLandingVideoUrl } from '@/lib/supabase/storage'

export default function LandingPage() {
  const landingVideoUrl = getLandingVideoUrl()
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={landingVideoUrl} type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-background/95" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <header>
          <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
            <div className="flex items-center gap-2">
              <Play className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">Reely</span>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full overflow-y-auto">
          <section className="container flex flex-col items-center justify-center gap-8 px-4 py-12 sm:py-16 text-center mx-auto max-w-7xl min-h-[calc(100vh-4rem-3.5rem)]">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl text-white drop-shadow-lg">
                Your Content, Reel-ified
              </h1>
              <p className="text-xl text-white/90 drop-shadow-md">
                Aggregate content from multiple sources and consume it in a beautiful, TikTok-style interface. 
                RSS feeds, YouTube, social media, and more, all in one swipeable feed.
              </p>
            </div>

            <div className="flex gap-4 flex-wrap justify-center">
              <Button size="lg" asChild>
                <Link href="/auth">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                <Link href="/app">
                  Explore Reels
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 max-w-5xl w-full mt-8">
              <div className="flex flex-col items-center gap-4 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Multi-Source Feeds</h3>
                <p className="text-sm text-foreground/80 text-center">
                  RSS, YouTube, Twitter, Reddit, podcasts, and more, all in one feed.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Smart Curation</h3>
                <p className="text-sm text-foreground/80 text-center">
                  AI learns your preferences to surface content you love.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Effortless Consumption</h3>
                <p className="text-sm text-foreground/80 text-center">
                  Stay informed without overwhelm. Swipe through reels, not tabs.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-4 w-full">
          <div className="container px-4 text-center text-sm text-white/50 mx-auto max-w-7xl">
            © 2025 Reely • Cursor Hackathon Singapore 2025
          </div>
        </footer>
      </div>
    </div>
  )
}
