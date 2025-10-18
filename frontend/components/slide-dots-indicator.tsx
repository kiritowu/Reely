import { cn } from '@/lib/utils'

interface SlideDotsIndicatorProps {
  total: number
  current: number
}

export function SlideDotsIndicator({ total, current }: SlideDotsIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            index === current
              ? 'w-6 bg-white'
              : 'w-1.5 bg-white/50'
          )}
        />
      ))}
    </div>
  )
}

