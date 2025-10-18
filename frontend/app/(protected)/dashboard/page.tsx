import { getCurrentUser, signOut } from '@/actions/auth'
import { getUserContentSources } from '@/actions/sources'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const sources = await getUserContentSources()

  return <DashboardClient user={user} initialSources={sources} />
}

