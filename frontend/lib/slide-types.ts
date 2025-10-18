// Generic Slide Type System
// This flexible architecture allows videos to have any combination of slides

// Base slide interface - all slides extend this
export interface BaseSlide {
  id: string
  type: string
  title?: string // Optional custom title for any slide
}

// Template 1: List-based content
// Use for: key points, predictions, features, steps, recommendations, etc.
export interface ListSlide extends BaseSlide {
  type: 'list'
  content: {
    heading?: string // e.g., "Key Takeaways", "What to Watch"
    items: Array<{
      icon?: string // Lucide icon name (e.g., 'Brain', 'Palette', 'Star')
      iconColor?: string // Icon color: preset ('blue', 'green', 'red', 'purple', 'yellow', 'pink') or hex ('#FF6B6B')
      title: string
      detail?: string
    }>
    layout?: 'vertical' | 'grid' // Display layout
  }
}

// Template 2: Metrics/Statistics
// Use for: numbers, data points, statistics, metrics
export interface MetricsSlide extends BaseSlide {
  type: 'metrics'
  content: {
    heading?: string // e.g., "By The Numbers"
    metrics: Array<{
      value: string
      label: string
      change?: string // e.g., "+15%", "+2.3M", "by 2030" - displays with trend icon if trend is set
      trend?: 'up' | 'down' | 'neutral' // Adds visual trend icon (TrendingUp/Down/Minus)
    }>
    columns?: 2 | 3 | 4 // Grid columns
  }
}

// Template 3: Text-heavy content
// Use for: context, explanation, analysis, summary, impact
export interface TextSlide extends BaseSlide {
  type: 'text'
  content: {
    heading?: string
    body: string
    callout?: string // Highlighted secondary info
    highlightStyle?: 'default' | 'gradient' | 'minimal'
  }
}

// Template 4: Action/Future predictions
// Use for: what's next, predictions, upcoming events, calls to action
export interface ActionSlide extends BaseSlide {
  type: 'action'
  content: {
    heading?: string // e.g., "What's Next?"
    items?: string[] // List of predictions/actions
    cta?: {
      text: string
      url: string
    }
  }
}

// Template 5: Quote/Impact statement
// Use for: expert quotes, key statements, impactful messages
export interface QuoteSlide extends BaseSlide {
  type: 'quote'
  content: {
    quote: string
    author?: string
    context?: string
  }
}

// Template 6: Comparison/Before-After
// Use for: comparisons, changes, transformations
export interface ComparisonSlide extends BaseSlide {
  type: 'comparison'
  content: {
    heading?: string
    before: {
      label: string
      value: string
      detail?: string
    }
    after: {
      label: string
      value: string
      detail?: string
    }
    context?: string
  }
}

// Template 7: Timeline/Process
// Use for: chronological events, step-by-step processes
export interface TimelineSlide extends BaseSlide {
  type: 'timeline'
  content: {
    heading?: string
    events: Array<{
      date?: string
      title: string
      description?: string
    }>
  }
}

// Union type for all possible slide types
// This maintains type safety while allowing flexibility
export type Slide =
  | ListSlide
  | MetricsSlide
  | TextSlide
  | ActionSlide
  | QuoteSlide
  | ComparisonSlide
  | TimelineSlide
  | BaseSlide // Fallback for custom/unknown types

// Type guard helpers
export const isListSlide = (slide: Slide): slide is ListSlide => slide.type === 'list'
export const isMetricsSlide = (slide: Slide): slide is MetricsSlide => slide.type === 'metrics'
export const isTextSlide = (slide: Slide): slide is TextSlide => slide.type === 'text'
export const isActionSlide = (slide: Slide): slide is ActionSlide => slide.type === 'action'
export const isQuoteSlide = (slide: Slide): slide is QuoteSlide => slide.type === 'quote'
export const isComparisonSlide = (slide: Slide): slide is ComparisonSlide => slide.type === 'comparison'
export const isTimelineSlide = (slide: Slide): slide is TimelineSlide => slide.type === 'timeline'

