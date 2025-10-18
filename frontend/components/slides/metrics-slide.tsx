import type { MetricsSlide } from '@/lib/slide-types'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'

interface MetricsSlideProps {
  slide: MetricsSlide
}

export function MetricsSlide({ slide }: MetricsSlideProps) {
  const columns = slide.content.columns || 2
  
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      case 'neutral':
        return <Minus className="h-4 w-4" />
      default:
        return null
    }
  }
  
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 py-12">
      <div className="mb-8 flex items-center justify-center gap-2">
        <BarChart3 className="h-6 w-6 text-white/80" strokeWidth={2} />
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          {slide.content.heading || 'By The Numbers'}
        </h2>
      </div>
      <div className={`mx-auto grid w-full gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {slide.content.metrics.map((metric, index) => (
          <div
            key={index}
            className="group flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 px-6 py-10 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            {metric.change && (
              <div className={`mb-1 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                metric.trend === 'up' 
                  ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20' 
                  : metric.trend === 'down' 
                  ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20' 
                  : 'bg-white/5 text-white/60 group-hover:bg-white/10'
              }`}>
                {getTrendIcon(metric.trend)}
                <span>{metric.change}</span>
              </div>
            )}
            <div className="mb-2 text-4xl font-bold tracking-tight text-white">
              {metric.value}
            </div>
            <div className="text-center text-xs font-medium text-white/70 transition-colors group-hover:text-white/90">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

