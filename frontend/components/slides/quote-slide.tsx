import type { QuoteSlide } from '@/lib/slide-types'
import { Quote, User } from 'lucide-react'

interface QuoteSlideProps {
  slide: QuoteSlide
}

export function QuoteSlide({ slide }: QuoteSlideProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 py-12">
      <div className="mx-auto w-full space-y-8">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm transition-all hover:border-white/20">
          {/* Decorative quote icon */}
          <Quote className="absolute -left-4 -top-4 h-8 w-8 text-white/30" strokeWidth={2} />
          
          <p className="text-center text-xl font-light italic leading-relaxed text-white/95">
            "{slide.content.quote}"
          </p>
        </div>

        {slide.content.author && (
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-full bg-white/10 p-2">
              <User className="h-4 w-4 text-white/60" strokeWidth={2} />
            </div>
            <p className="text-base font-semibold text-white">
              {slide.content.author}
            </p>
          </div>
        )}

        {slide.content.context && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-5 backdrop-blur-sm">
            <p className="text-center text-xs leading-relaxed text-white/70">
              {slide.content.context}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

