import { getCurrentUser } from '@/actions/auth'
import { getUserContentSources } from '@/actions/sources'
import { AccountClient } from './account-client'

export default async function AccountPage() {
  const user = await getCurrentUser()
  const sources = await getUserContentSources()

  return <AccountClient user={user} sources={sources} />
}

