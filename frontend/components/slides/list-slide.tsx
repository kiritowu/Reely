import type { ListSlide } from '@/lib/slide-types'
import * as LucideIcons from 'lucide-react'
import { List } from 'lucide-react'

interface ListSlideProps {
  slide: ListSlide
}

// Helper to get Lucide icon component by name
function getIconComponent(iconName?: string) {
  if (!iconName) return null
  
  // Convert icon name to PascalCase if needed (e.g., 'brain' -> 'Brain')
  const pascalName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  const Icon = (LucideIcons as any)[pascalName]
  
  return Icon || null
}

// Helper to get icon color class or inline style
function getIconColor(color?: string) {
  if (!color) return { className: 'text-white/90', bgClassName: 'bg-white/10' }
  
  // Preset colors with background variants
  const presetColors: Record<string, { className: string; bgClassName: string }> = {
    blue: { className: 'text-blue-400', bgClassName: 'bg-blue-500/10' },
    green: { className: 'text-green-400', bgClassName: 'bg-green-500/10' },
    red: { className: 'text-red-400', bgClassName: 'bg-red-500/10' },
    purple: { className: 'text-purple-400', bgClassName: 'bg-purple-500/10' },
    yellow: { className: 'text-yellow-400', bgClassName: 'bg-yellow-500/10' },
    pink: { className: 'text-pink-400', bgClassName: 'bg-pink-500/10' },
    orange: { className: 'text-orange-400', bgClassName: 'bg-orange-500/10' },
    cyan: { className: 'text-cyan-400', bgClassName: 'bg-cyan-500/10' },
    emerald: { className: 'text-emerald-400', bgClassName: 'bg-emerald-500/10' },
    indigo: { className: 'text-indigo-400', bgClassName: 'bg-indigo-500/10' },
    rose: { className: 'text-rose-400', bgClassName: 'bg-rose-500/10' },
    amber: { className: 'text-amber-400', bgClassName: 'bg-amber-500/10' },
  }
  
  // Check if it's a preset color
  if (presetColors[color.toLowerCase()]) {
    return presetColors[color.toLowerCase()]
  }
  
  // Check if it's a hex color
  if (color.startsWith('#')) {
    return { style: { color }, className: '', bgClassName: 'bg-white/10' }
  }
  
  // Default fallback
  return { className: 'text-white/90', bgClassName: 'bg-white/10' }
}

export function ListSlide({ slide }: ListSlideProps) {
  const layout = slide.content.layout || 'vertical'
  
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 py-12">
      <div className="mb-8 flex items-center justify-center gap-2">
        <List className="h-6 w-6 text-white/80" strokeWidth={2} />
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          {slide.content.heading || 'Key Points'}
        </h2>
      </div>
      <div className={`mx-auto w-full ${
        layout === 'grid' 
          ? 'max-w-5xl grid grid-cols-2 gap-5' 
          : 'max-w-4xl space-y-4'
      }`}>
        {slide.content.items.map((item, index) => {
          const Icon = getIconComponent(item.icon)
          const iconColorProps = getIconColor(item.iconColor)
          
          if (layout === 'vertical') {
            // Horizontal layout for vertical list (icon left, content right)
            return (
              <div
                key={index}
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:scale-[1.02]"
              >
                {Icon && (
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${iconColorProps.bgClassName} transition-transform group-hover:scale-110`}>
                    <Icon 
                      className={`h-7 w-7 ${iconColorProps.className || ''}`}
                      style={iconColorProps.style}
                      strokeWidth={2} 
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold leading-snug text-white transition-colors">
                    {item.title}
                  </h3>
                  {item.detail && (
                    <p className="text-sm leading-relaxed text-white/70 transition-colors group-hover:text-white/85">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            )
          }
          
          // Grid layout (icon top, content below - left aligned)
          return (
            <div
              key={index}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:scale-[1.02]"
            >
              {Icon && (
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconColorProps.bgClassName} transition-transform group-hover:scale-110`}>
                  <Icon 
                    className={`h-6 w-6 ${iconColorProps.className || ''}`}
                    style={iconColorProps.style}
                    strokeWidth={2} 
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold leading-snug text-white transition-colors">
                  {item.title}
                </h3>
                {item.detail && (
                  <p className="text-sm leading-relaxed text-white/70 transition-colors group-hover:text-white/85">
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

