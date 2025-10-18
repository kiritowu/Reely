// Import new generic slide types
import type { Slide } from './slide-types'

export type { Slide } from './slide-types'

export interface Video {
  id: string
  src: string
  title: string
  description: string
  category: 'tech' | 'politics' | 'science' | 'business' | 'sports' | 'entertainment' | 'health'
  source: string
  timestamp: string
  thumbnail?: string
  slides: Slide[]
}

export const videos: Video[] = [
  {
    id: '1',
    src: '/videos/video-1.mp4',
    title: 'OpenAI Launches GPT-5 with Breakthrough Features',
    description: 'New AI model shows 40% improvement in reasoning tasks and multimodal capabilities',
    category: 'tech',
    source: 'TechCrunch',
    timestamp: '5 hours ago',
    slides: [
      {
        id: '1-1',
        type: 'list',
        content: {
          heading: 'Key Takeaways',
          items: [
            {
              title: '40% Better Reasoning',
              detail: 'Significant improvement over GPT-4 in complex problem-solving',
              icon: 'Brain',
              iconColor: 'purple'
            },
            {
              title: 'Multimodal Capabilities',
              detail: 'Process text, images, and audio simultaneously',
              icon: 'Palette',
              iconColor: 'pink'
            },
            {
              title: 'Plus Subscriber Access',
              detail: 'Available now for ChatGPT Plus members at $20/month',
              icon: 'Star',
              iconColor: 'yellow'
            },
            {
              title: 'Reduced Hallucinations',
              detail: '60% fewer incorrect or misleading responses',
              icon: 'CheckCircle',
              iconColor: 'green'
            }
          ],
          layout: 'vertical'
        }
      },
      {
        id: '1-2',
        type: 'metrics',
        content: {
          heading: 'By The Numbers',
          metrics: [
            { value: '175B', label: 'Parameters', change: '+75B' },
            { value: '2M+', label: 'Day 1 Users', change: '+2M', trend: 'up' },
            { value: '$20', label: 'Monthly Cost' },
            { value: '3x', label: 'Faster Speed', change: '+200%', trend: 'up' }
          ],
          columns: 2
        }
      },
      {
        id: '1-3',
        type: 'text',
        content: {
          heading: 'WHY THIS MATTERS',
          body: 'This represents the biggest leap in AI capabilities since ChatGPT\'s launch in 2022. The improvements in reasoning and reduced hallucinations could transform industries from healthcare to education, making AI assistants more reliable for critical tasks.',
          callout: 'Potential to accelerate AI adoption in professional environments by 50%',
          highlightStyle: 'gradient'
        }
      },
      {
        id: '1-4',
        type: 'action',
        content: {
          heading: 'What\'s Next?',
          items: [
            'Enterprise version launching Q2 2025',
            'API access expanding to 50+ countries',
            'Integration with Microsoft Office suite',
            'Specialized models for healthcare and legal'
          ],
          cta: {
            text: 'Read Full Article',
            url: 'https://techcrunch.com'
          }
        }
      }
    ],
  },
  {
    id: '2',
    src: '/videos/video-2.mp4',
    title: 'Global Climate Summit Reaches Historic Agreement',
    description: '150+ nations commit to net-zero emissions by 2050 with binding targets',
    category: 'science',
    source: 'BBC News',
    timestamp: '2 hours ago',
    slides: [
      {
        id: '2-1',
        type: 'list',
        content: {
          heading: 'Key Points',
          items: [
            {
              title: '150+ Nations United',
              detail: 'Largest climate agreement in history with binding commitments',
              icon: 'Globe',
              iconColor: 'blue'
            },
            {
              title: '$500B Climate Fund',
              detail: 'New financing mechanism for developing nations',
              icon: 'DollarSign',
              iconColor: 'emerald'
            },
            {
              title: 'Coal Phase-Out 2040',
              detail: 'Accelerated timeline for fossil fuel elimination',
              icon: 'Zap',
              iconColor: 'amber'
            }
          ],
          layout: 'vertical'
        }
      },
      {
        id: '2-2',
        type: 'metrics',
        content: {
          heading: 'By The Numbers',
          metrics: [
            { value: '2050', label: 'Net-Zero Target' },
            { value: '500B', label: 'USD Funding', change: '+300B', trend: 'up' },
            { value: '45%', label: 'Emission Cut', change: 'by 2030' },
            { value: '150+', label: 'Countries' }
          ],
          columns: 2
        }
      },
      {
        id: '2-3',
        type: 'quote',
        content: {
          quote: 'This is the most significant climate agreement in human history. We finally have binding targets with real consequences.',
          author: 'UN Secretary General',
          context: 'Previous agreements lacked enforcement mechanisms'
        }
      }
    ],
  },
  {
    id: '3',
    src: '/videos/video-3.mp4',
    title: 'Major Breakthrough in Cancer Treatment Trials',
    description: 'New immunotherapy shows 85% success rate in late-stage patients',
    category: 'health',
    source: 'Nature Medicine',
    timestamp: '1 day ago',
    slides: [
      {
        id: '3-1',
        type: 'metrics',
        content: {
          heading: 'Trial Results',
          metrics: [
            { value: '85%', label: 'Success Rate', change: '+40%', trend: 'up' },
            { value: '2,000+', label: 'Trial Patients' },
            { value: '6-12mo', label: 'FDA Approval' },
            { value: '70%', label: 'Fewer Side Effects', change: 'vs chemo', trend: 'up' }
          ],
          columns: 2
        }
      },
      {
        id: '3-2',
        type: 'text',
        content: {
          heading: 'THE BREAKTHROUGH',
          body: 'This new immunotherapy approach teaches the immune system to recognize and destroy cancer cells more effectively. Traditional treatments plateau at 40-50% effectiveness for late-stage cancers.',
          callout: 'Could save 500,000+ lives annually worldwide',
          highlightStyle: 'gradient'
        }
      },
      {
        id: '3-3',
        type: 'comparison',
        content: {
          heading: 'Traditional vs. New Treatment',
          before: {
            label: 'Chemotherapy',
            value: '45%',
            detail: 'Success rate with severe side effects'
          },
          after: {
            label: 'Immunotherapy',
            value: '85%',
            detail: '70% fewer adverse reactions'
          },
          context: 'Based on 2,000+ patient Phase III trials'
        }
      }
    ],
  },
]

// Create an infinite loop of videos by repeating the array
export const getInfiniteVideos = (repeatCount: number = 3): Video[] => {
  return Array.from({ length: repeatCount }, (_, i) =>
    videos.map((video) => ({
      ...video,
      id: `${video.id}-${i}`,
    }))
  ).flat()
}

