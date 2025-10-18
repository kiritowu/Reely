import type { BaseSlide } from '@/lib/slide-types'
import { AlertCircle, Code2 } from 'lucide-react'

interface GenericSlideProps {
  slide: BaseSlide & { content?: unknown }
}

// Fallback component for unknown slide types
export function GenericSlide({ slide }: GenericSlideProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-12 py-16">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="rounded-xl bg-amber-500/20 p-3">
                <AlertCircle className="h-6 w-6 text-amber-400" strokeWidth={2.5} />
              </div>
              <p className="text-sm font-medium uppercase tracking-wider text-amber-400/80">
                Unknown Slide Type: {slide.type}
              </p>
            </div>
            {slide.title && (
              <h2 className="mb-6 text-2xl font-bold text-white">
                {slide.title}
              </h2>
            )}
            {slide.content !== undefined && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                <div className="mb-3 flex items-center gap-2 text-white/60">
                  <Code2 className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Debug Information
                  </span>
                </div>
                <pre className="max-h-96 overflow-auto text-left text-xs text-white/70">
                  {JSON.stringify(slide.content, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

