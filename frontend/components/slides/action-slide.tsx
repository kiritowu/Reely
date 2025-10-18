import type { ActionSlide } from '@/lib/slide-types'
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActionSlideProps {
  slide: ActionSlide
}

export function ActionSlide({ slide }: ActionSlideProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 py-12">
      <div className="mb-8 flex items-center justify-center gap-2">
        <Zap className="h-6 w-6 text-white/80" strokeWidth={2.5} />
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          {slide.content.heading || "What's Next?"}
        </h2>
      </div>
      <div className="mx-auto w-full space-y-8">
        {slide.content.items && slide.content.items.length > 0 && (
          <div className="space-y-3">
            {slide.content.items.map((item, index) => (
              <div
                key={index}
                className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" strokeWidth={2.5} />
                </div>
                <p className="flex-1 text-base text-white/90 transition-colors group-hover:text-white">
                  {item}
                </p>
              </div>
            ))}
          </div>
        )}

        {slide.content.cta && (
          <div className="flex justify-center pt-4">
            <Button
              className="group rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              size="lg"
              onClick={() => window.open(slide.content.cta?.url, '_blank')}
            >
              {slide.content.cta.text}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

