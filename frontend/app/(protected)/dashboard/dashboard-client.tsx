'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserContentSources } from '@/actions/sources'
import { SourceForm } from '@/components/source-form'
import { SourceList } from '@/components/source-list'
import { AppHeader } from '@/components/app-header'
import type { ContentSource } from '@/db/schema'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface DashboardClientProps {
  user: SupabaseUser | null
  initialSources: ContentSource[]
}

export function DashboardClient({ user, initialSources }: DashboardClientProps) {
  const [isSourceFormOpen, setIsSourceFormOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<ContentSource | null>(null)

  const { data: sources = initialSources, refetch } = useQuery({
    queryKey: ['content-sources'],
    queryFn: getUserContentSources,
    initialData: initialSources,
  })

  function handleAddSource() {
    setEditingSource(null)
    setIsSourceFormOpen(true)
  }

  function handleEditSource(source: ContentSource) {
    setEditingSource(source)
    setIsSourceFormOpen(true)
  }

  function handleFormClose() {
    setIsSourceFormOpen(false)
    setEditingSource(null)
  }

  function handleFormSuccess() {
    refetch()
  }

  const activeSourcesCount = sources.filter((s) => s.isActive).length
  const totalSourcesCount = sources.length

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-1 container px-4 py-8 mx-auto max-w-7xl w-full">
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Content Sources</h1>
            <p className="text-sm text-muted-foreground">
              {activeSourcesCount} of {totalSourcesCount} sources active
            </p>
          </div>

          <SourceList
            sources={sources}
            onEdit={handleEditSource}
            onRefetch={() => refetch()}
            onAddSource={handleAddSource}
          />
        </div>
      </main>

      {/* Source Form Dialog */}
      <SourceForm
        isOpen={isSourceFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingSource={editingSource}
      />
    </div>
  )
}

