import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'

/**
 * Protected Layout
 * Ensures user is authenticated before accessing any pages in this group
 */
export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth')
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    redirect('/auth?error=Please verify your email')
  }

  return <>{children}</>
}

