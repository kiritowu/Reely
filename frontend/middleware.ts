import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

/**
 * Next.js Middleware for Supabase Auth
 * 
 * CRITICAL: This middleware is MANDATORY for proper session management.
 * It runs on every request to:
 * 1. Refresh expired auth tokens automatically
 * 2. Protect routes requiring authentication
 * 3. Handle redirects based on auth state
 * 
 * Without this, users will be randomly logged out!
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

