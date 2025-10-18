'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Rss } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import type { ContentSource } from '@/db/schema'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AccountClientProps {
  user: SupabaseUser | null
  sources: ContentSource[]
}

export function AccountClient({ user, sources }: AccountClientProps) {
  const activeSourcesCount = sources.filter((s) => s.isActive).length
  const totalSourcesCount = sources.length

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-1 container px-4 py-8 mx-auto max-w-2xl w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">User ID</span>
                  <span className="text-xs text-muted-foreground font-mono break-all">
                    {user?.id}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">Email Verified</span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ✓ Verified
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rss className="h-5 w-5" />
                  Content Statistics
                </CardTitle>
                <CardDescription>Overview of your content sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{totalSourcesCount}</div>
                    <div className="text-xs text-muted-foreground">Total Sources</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{activeSourcesCount}</div>
                    <div className="text-xs text-muted-foreground">Active Sources</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

