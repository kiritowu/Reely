'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { createContentSource, updateContentSource } from '@/actions/sources'
import {
  createContentSourceFormSchema,
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  SCRAPE_FREQUENCIES,
  SCRAPE_FREQUENCY_LABELS,
  type CreateContentSourceInput,
  type CreateContentSourceFormData,
  type SourceType,
  type Category,
  type ScrapeFrequency,
} from '@/types'
import { Loader2, XCircle, Link2, Globe, Youtube, Twitter, MessageSquare, Podcast, Code, Github } from 'lucide-react'
import type { ContentSource } from '@/db/schema'
import { toast } from 'sonner'

interface SourceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editingSource?: ContentSource | null
}

// Helper function to get icon for source type
function getSourceTypeIcon(type: SourceType) {
  const icons: Record<SourceType, typeof Link2> = {
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

export function SourceForm({ isOpen, onClose, onSuccess, editingSource }: SourceFormProps) {
  const isEditing = !!editingSource

  const form = useForm<CreateContentSourceFormData>({
    resolver: zodResolver(createContentSourceFormSchema),
    defaultValues: {
      sourceType: 'url',
      sourceUrl: '',
      displayName: '',
      description: '',
      category: 'all',
      scrapeFrequency: 'daily',
      isActive: true,
    },
  })

  // Reset form when dialog opens or editingSource changes
  useEffect(() => {
    if (isOpen) {
      if (editingSource) {
        // Populate form with editing source data
        form.reset({
          sourceType: (editingSource.sourceType as SourceType) || 'url',
          sourceUrl: editingSource.sourceUrl || '',
          displayName: editingSource.displayName || '',
          description: editingSource.description || '',
          category: (editingSource.category as Category) || 'all',
          scrapeFrequency: (editingSource.scrapeFrequency as ScrapeFrequency) || 'daily',
          isActive: editingSource.isActive ?? true,
        })
      } else {
        // Reset to default values for new source
        form.reset({
          sourceType: 'url',
          sourceUrl: '',
          displayName: '',
          description: '',
          category: 'all',
          scrapeFrequency: 'daily',
          isActive: true,
        })
      }
    }
  }, [isOpen, editingSource, form])

  const mutation = useMutation({
    mutationFn: async (values: CreateContentSourceInput) => {
      const result = isEditing
        ? await updateContentSource({ id: editingSource.id, ...values })
        : await createContentSource(values)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (data) => {
      toast.success(isEditing ? 'Source updated successfully' : 'Source successfully added', {
        description: data.message,
      })
      onClose()
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Source form error:', error)
      toast.error('Failed to save source', {
        description: error instanceof Error ? error.message : 'An error occurred while saving the source',
      })
    },
  })

  function onSubmit(values: CreateContentSourceFormData) {
    mutation.mutate(values)
  }

  function handleClose() {
    if (!mutation.isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Content Source' : 'Add Content Source'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your content source details below.'
              : 'Add a new content source to your feed. This can be a website, RSS feed, social media account, or API endpoint.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Source Type */}
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={mutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_TYPES.map((type) => {
                          const Icon = getSourceTypeIcon(type)
                          return (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{SOURCE_TYPE_LABELS[type]}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of content source you want to add
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source URL */}
              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        disabled={mutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL or identifier for the content source
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Display Name */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Favorite Blog"
                        disabled={mutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A friendly name for this source
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={mutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Scrape Frequency */}
                <FormField
                  control={form.control}
                  name="scrapeFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Update Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={mutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SCRAPE_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {SCRAPE_FREQUENCY_LABELS[freq]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Active Status - Only show when editing */}
              {isEditing && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable this source to start receiving content
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={mutation.isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {mutation.isError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : 'An error occurred while saving the source'}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Source' : 'Add Source'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

