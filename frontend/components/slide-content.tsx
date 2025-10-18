import type { Slide } from '@/lib/slide-types'
import { 
  isListSlide, 
  isMetricsSlide, 
  isTextSlide, 
  isActionSlide, 
  isQuoteSlide, 
  isComparisonSlide 
} from '@/lib/slide-types'
import { ListSlide } from './slides/list-slide'
import { MetricsSlide } from './slides/metrics-slide'
import { TextSlide } from './slides/text-slide'
import { ActionSlide } from './slides/action-slide'
import { QuoteSlide } from './slides/quote-slide'
import { ComparisonSlide } from './slides/comparison-slide'
import { GenericSlide } from './slides/generic-slide'

interface SlideContentProps {
  slide: Slide
}

/**
 * Generic slide content renderer with component mapping
 * Supports any slide type and automatically routes to the appropriate component
 */
export function SlideContent({ slide }: SlideContentProps) {
  // Use type guards for type-safe rendering
  if (isListSlide(slide)) {
    return <ListSlide slide={slide} />
  }
  
  if (isMetricsSlide(slide)) {
    return <MetricsSlide slide={slide} />
  }
  
  if (isTextSlide(slide)) {
    return <TextSlide slide={slide} />
  }
  
  if (isActionSlide(slide)) {
    return <ActionSlide slide={slide} />
  }
  
  if (isQuoteSlide(slide)) {
    return <QuoteSlide slide={slide} />
  }
  
  if (isComparisonSlide(slide)) {
    return <ComparisonSlide slide={slide} />
  }
  
  // Fallback for unknown/custom slide types
  return <GenericSlide slide={slide} />
}

