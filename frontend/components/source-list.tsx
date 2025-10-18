'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { deleteContentSource, toggleSourceActive } from '@/actions/sources'
import {
  SOURCE_TYPE_LABELS,
  CATEGORY_LABELS,
  SCRAPE_FREQUENCY_LABELS,
  type SourceType,
  type Category,
  type ScrapeFrequency,
} from '@/types'
import {
  Link2,
  Globe,
  Youtube,
  Twitter,
  MessageSquare,
  Podcast,
  Code,
  Github,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentSource } from '@/db/schema'
import { formatDistanceToNow } from 'date-fns'

interface SourceListProps {
  sources: ContentSource[]
  onEdit: (source: ContentSource) => void
  onRefetch: () => void
  onAddSource: () => void
}

// Helper function to get icon for source type
function getSourceTypeIcon(type: string) {
  const icons: Record<string, typeof Link2> = {
    url: Link2,
    rss_feed: Globe,
    youtube_channel: Youtube,
    youtube_playlist: Youtube,
    twitter_user: Twitter,
    reddit_subreddit: MessageSquare,
    podcast_rss: Podcast,
    api_endpoint: Code,
    github_repo: Github,
  }
  return icons[type] || Link2
}

// Helper function to get category color
function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    tech: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    politics: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    science: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    business: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    sports: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    entertainment: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    health: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
    all: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  }
  return colors[category] || colors.all
}

export function SourceList({ sources, onEdit, onRefetch, onAddSource }: SourceListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState<ContentSource | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      const result = await deleteContentSource({ id: sourceId })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      setDeleteDialogOpen(false)
      setSourceToDelete(null)
      onRefetch()
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const result = await toggleSourceActive({ id, isActive })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      onRefetch()
    },
  })

  function handleDeleteClick(source: ContentSource) {
    setSourceToDelete(source)
    setDeleteDialogOpen(true)
  }

  function handleDeleteConfirm() {
    if (sourceToDelete) {
      deleteMutation.mutate(sourceToDelete.id)
    }
  }

  function handleToggleActive(source: ContentSource) {
    toggleActiveMutation.mutate({
      id: source.id,
      isActive: !source.isActive,
    })
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No content sources yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Add your first content source to start building your personalized feed. You can add websites, RSS feeds, social media accounts, and more.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {/* Add Source Card */}
        <div 
          className="group rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer bg-transparent h-full"
          onClick={onAddSource}
        >
          <div className="flex flex-col items-center justify-center py-10 h-full">
            <div className="rounded-full bg-muted p-3 mb-3 group-hover:bg-primary/10 transition-colors">
              <Globe className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-base font-semibold mb-1">Add Source</h3>
            <p className="text-xs text-muted-foreground text-center">
              Add a new content source
            </p>
          </div>
        </div>

        {sources.map((source) => {
          const Icon = getSourceTypeIcon(source.sourceType)
          const categoryColor = getCategoryColor(source.category)

          return (
            <div 
              key={source.id} 
              className={cn(
                'relative rounded-xl border bg-card shadow-sm flex flex-col h-full',
                !source.isActive && 'opacity-60'
              )}
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h3 className="text-sm font-semibold line-clamp-1">
                        {source.displayName}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 truncate">
                        {source.sourceUrl}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-0.5">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(source)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(source.sourceUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open URL
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(source)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 flex-1 flex flex-col">
                {source.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">
                    {source.description}
                  </p>
                )}

                {/* Status Info */}
                {source.lastSuccessfulScrapeAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2.5">
                    <CheckCircle2 className="h-3 w-3 text-chart-2 shrink-0" />
                    <span className="line-clamp-1">
                      Updated {formatDistanceToNow(new Date(source.lastSuccessfulScrapeAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}

                {source.lastError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-destructive mb-2.5">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">{source.lastError}</span>
                  </div>
                )}

                {/* Bottom Row: Tags + Active Toggle */}
                <div className="flex items-center justify-between pt-2.5 mt-auto gap-3">
                  {/* Tags on the left */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn(categoryColor, "text-[11px] h-5 px-1.5")}>
                      <Tag className="mr-1 h-2.5 w-2.5" />
                      {CATEGORY_LABELS[source.category as Category]}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] h-5 px-1.5">
                      <Clock className="mr-1 h-2.5 w-2.5" />
                      {SCRAPE_FREQUENCY_LABELS[source.scrapeFrequency as ScrapeFrequency]}
                    </Badge>
                  </div>

                  {/* Active Toggle on the right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium">
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={source.isActive}
                      onCheckedChange={() => handleToggleActive(source)}
                      disabled={toggleActiveMutation.isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom padding */}
              <div className="pb-3.5" />
            </div>
          )
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{sourceToDelete?.displayName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : 'Failed to delete source'}
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

