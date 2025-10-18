'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Play, LogOut, User, Video, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/actions/auth'
import { WatchFeedButton } from '@/components/watch-feed-button'

export function AppHeader() {

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Play className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">Reely</span>
        </Link>
        <div className="flex items-center gap-2">
          <WatchFeedButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <Play className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut()
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

