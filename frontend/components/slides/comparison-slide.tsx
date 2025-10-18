import type { ComparisonSlide } from '@/lib/slide-types'
import { ArrowRight, GitCompare, X, Check } from 'lucide-react'

interface ComparisonSlideProps {
  slide: ComparisonSlide
}

export function ComparisonSlide({ slide }: ComparisonSlideProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 py-12">
      {slide.content.heading && (
        <div className="mb-8 flex items-center justify-center gap-2">
          <GitCompare className="h-6 w-6 text-white/80" strokeWidth={2.5} />
          <h2 className="text-center text-2xl font-bold tracking-tight text-white">
            {slide.content.heading}
          </h2>
        </div>
      )}
      
      <div className="mx-auto w-full space-y-5">
        <div className="flex items-center gap-4">
          {/* Before */}
          <div className="group flex-1 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-500/10">
            <div className="mb-4 flex items-center justify-center gap-1.5">
              <div className="rounded-lg bg-red-500/20 p-1.5">
                <X className="h-4 w-4 text-red-400" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-red-400/80">
                {slide.content.before.label}
              </span>
            </div>
            <div className="mb-3 text-center text-4xl font-bold tracking-tight text-white">
              {slide.content.before.value}
            </div>
            {slide.content.before.detail && (
              <p className="mt-3 text-center text-xs leading-relaxed text-white/70 transition-colors group-hover:text-white/80">
                {slide.content.before.detail}
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex flex-shrink-0 items-center justify-center">
            <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
              <ArrowRight className="h-5 w-5 text-white/60" strokeWidth={2.5} />
            </div>
          </div>

          {/* After */}
          <div className="group flex-1 rounded-2xl border border-green-500/30 bg-green-500/5 p-5 backdrop-blur-sm transition-all hover:border-green-500/50 hover:bg-green-500/10">
            <div className="mb-4 flex items-center justify-center gap-1.5">
              <div className="rounded-lg bg-green-500/20 p-1.5">
                <Check className="h-4 w-4 text-green-400" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-green-400/80">
                {slide.content.after.label}
              </span>
            </div>
            <div className="mb-3 text-center text-4xl font-bold tracking-tight text-white">
              {slide.content.after.value}
            </div>
            {slide.content.after.detail && (
              <p className="mt-3 text-center text-xs leading-relaxed text-white/70 transition-colors group-hover:text-white/80">
                {slide.content.after.detail}
              </p>
            )}
          </div>
        </div>

        {slide.content.context && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-center text-xs leading-relaxed text-white/70">
              {slide.content.context}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

