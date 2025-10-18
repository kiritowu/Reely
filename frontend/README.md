# Reely

Transform your content feeds into engaging video reels. Aggregate content from multiple sources and consume it in a beautiful, TikTok-style interface.

## Tech Stack

- **Next.js 15** - App Router, Server Actions, Turbopack
- **React 19** - Latest React features
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - CSS-first configuration
- **shadcn/ui** - All 54 components installed
- **Supabase** - Authentication & PostgreSQL database
- **Drizzle ORM** - Type-safe database queries
- **React Hook Form** - Form state management
- **Zod v4** - Schema validation
- **TanStack Query v5** - Server state management
- **Lucide React** - Icon library
- **next-themes** - Theme switching (light/dark/system)
- **pnpm** - Fast, efficient package manager

## Features

- 🎥 **Video Reel Interface**
  - TikTok-style vertical scrolling
  - Auto-play videos with smooth transitions
  - Swipeable information slides for each video
  - Keyboard navigation (arrow keys)
  - Mobile-first responsive design
  
- 📡 **Multi-Source Content Aggregation**
  - Support for URLs, RSS feeds, YouTube channels/playlists
  - Social media: Twitter/X, Reddit subreddits
  - Podcasts, GitHub repos, and API endpoints
  - Customizable scraping frequencies (realtime, hourly, daily, weekly)
  - Category-based organization (tech, politics, science, business, etc.)
  
- 🔐 **Secure Authentication**
  - Email/password authentication with Supabase
  - Email verification required
  - Whitelisted email domains (Gmail, Outlook, Yahoo, etc.)
  - Session management with automatic token refresh
  
- ⚡ **Modern Architecture**
  - Server Actions with type-safe error handling
  - Custom `ActionResult` utility for consistent API responses
  - TanStack Query integration with `useMutation`
  - Drizzle ORM with PostgreSQL
  - Middleware-based session refresh
  
- 🎨 **Beautiful UI**
  - Responsive design with Tailwind CSS v4
  - Dark/light/system theme support
  - Information slides: metrics, quotes, comparisons, lists
  - shadcn/ui components

## Project Structure

```
actions/              ← Server Actions (domain-based)
  auth.ts             ← Authentication actions
  hello.ts            ← Example form actions
  
lib/
  supabase/           ← Supabase clients
    client.ts         ← Browser client
    server.ts         ← Server component client
    middleware.ts     ← Middleware client
  db.ts               ← Drizzle connection
  action-result.ts    ← Custom error handling utility

db/
  schema.ts           ← Drizzle ORM schemas
  migrations/         ← Database migrations

types/                ← TypeScript types & Zod schemas
  auth.ts             ← Auth types
  hello.ts            ← Example types
  index.ts            ← Central exports

components/           ← React components
  auth-form.tsx       ← Authentication UI
  theme-toggle.tsx    ← Theme switcher
  providers/          ← Context providers
  ui/                 ← shadcn components

app/
  (public)/           ← Unauthenticated routes
    page.tsx          ← Landing page
    auth/
      page.tsx        ← Login/signup
      callback/
        route.ts      ← Email verification callback
  (protected)/        ← Authenticated routes (requires verified email)
    dashboard/
      page.tsx        ← Main dashboard
    [dbId]/           ← Dynamic database routes
  layout.tsx          ← Root layout
  page.tsx            ← Root redirect

middleware.ts         ← Session refresh & route protection
```

## Getting Started

### 1. Prerequisites

- Node.js 18+ (or 20+)
- pnpm installed (`npm install -g pnpm`)
- Supabase account (https://supabase.com)

### 2. Setup Supabase

1. Create a new Supabase project at https://supabase.com/dashboard
2. Go to **Project Settings > API** and copy:
   - Project URL
   - Anon/Public key
3. Go to **Project Settings > Database** and copy:
   - Connection string (URI mode)
4. Enable email auth:
   - Go to **Authentication > Providers**
   - Enable **Email** provider
   - Enable **Confirm email** (require email verification)
5. Configure email templates:
   - Go to **Authentication > Email Templates**
   - Update **Confirm Signup** template redirect URL to: `{{ .SiteURL }}/auth/callback`

### 3. Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Setup Database

Push the Drizzle schema to your Supabase database:

```bash
pnpm db:push
```

This creates the `profiles` table linked to Supabase's `auth.users`.

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server

# Database commands
pnpm db:generate  # Generate migrations from schema
pnpm db:migrate   # Apply migrations
pnpm db:push      # Push schema directly to database (dev)
pnpm db:studio    # Open Drizzle Studio (database GUI)
```

## Authentication Flow

1. **Sign Up**
   - User enters email (must be from whitelisted domain) and password
   - Server validates input and creates Supabase auth user
   - Verification email sent automatically
   - Profile created in `profiles` table
   
2. **Email Verification**
   - User clicks verification link in email
   - Redirected to `/auth/callback` which exchanges code for session
   - Redirected to dashboard
   
3. **Sign In**
   - User enters credentials
   - Server checks email is verified
   - If verified, session created and redirected to dashboard
   - If not verified, error message shown
   
4. **Session Management**
   - Middleware runs on every request
   - Automatically refreshes expired tokens
   - Protected routes require authenticated user
   - Unauthenticated users redirected to `/auth`

## Whitelisted Email Domains

Currently allowed domains:
- gmail.com
- outlook.com / hotmail.com
- yahoo.com
- icloud.com
- protonmail.com / proton.me
- live.com
- msn.com
- aol.com

To modify, edit `types/auth.ts`.

## Architecture Decisions

### Why Middleware for Auth?

According to Supabase SSR documentation, **middleware is mandatory** for proper session management:
- Refreshes expired tokens automatically
- Sets cookies reliably across all routes
- Prevents random logouts
- Runs before any components load

### Why Drizzle + Supabase?

- **Supabase**: Handles authentication (built-in, secure, tested)
- **Drizzle**: Manages application data (type-safe, flexible, modern)
- Best of both worlds: Let each tool do what it does best

### Custom Error Handling

The `ActionResult` type provides:
- Fully serializable (works across server/client boundary)
- Type-safe success/error states
- Integrates seamlessly with TanStack Query
- Concise error handling with `unwrapResult`

## Deployment

1. Push to GitHub
2. Deploy to Vercel/Netlify
3. Add environment variables in dashboard
4. Update `NEXT_PUBLIC_SITE_URL` to production URL
5. Update Supabase email template redirect URLs

## Contributing

This is a hackathon project. Feel free to fork and modify!

## License

MIT
