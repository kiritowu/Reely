import type { TextSlide } from '@/lib/slide-types'
import { Lightbulb, Sparkles, Info } from 'lucide-react'

interface TextSlideProps {
  slide: TextSlide
}

export function TextSlide({ slide }: TextSlideProps) {
  const highlightStyle = slide.content.highlightStyle || 'default'
  
  // Icon mapping for callout styles
  const getCalloutIcon = () => {
    switch (highlightStyle) {
      case 'gradient':
        return <Sparkles className="h-4 w-4" />
      case 'minimal':
        return <Info className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }
  
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 py-12">
      <div className="mx-auto w-full space-y-6">
        {slide.content.heading && (
          <h2 className="text-center text-2xl font-bold tracking-tight text-white">
            {slide.content.heading}
          </h2>
        )}
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-white/20">
          <p className="text-center text-lg leading-relaxed text-white/90">
            {slide.content.body}
          </p>
        </div>

        {slide.content.callout && (
          <div className={`group rounded-2xl border backdrop-blur-sm transition-all ${
            highlightStyle === 'gradient'
              ? 'border-primary/30 bg-primary/10 hover:border-primary/50'
              : highlightStyle === 'minimal'
              ? 'border-white/10 bg-white/5 hover:border-white/20'
              : 'border-white/20 bg-white/10 hover:border-white/30'
          }`}>
            <div className="flex items-center justify-center gap-2 px-6 pt-5 pb-3">
              <span className={`transition-colors ${
                highlightStyle === 'gradient' 
                  ? 'text-primary group-hover:text-primary/80' 
                  : 'text-white/60 group-hover:text-white/80'
              }`}>
                {getCalloutIcon()}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-white/60 group-hover:text-white/80">
                Key Insight
              </span>
            </div>
            <p className="px-6 pb-6 text-center text-sm font-medium text-white">
              {slide.content.callout}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

