'use client'

import { Loader } from '@mantine/core'
import { AdminProjectList } from './_component/AdminProjectList'
import { useAdminAccessGuard } from '@/hooks/useAdminAccessGuard'

export default function Page() {
  const { user, isLoading } = useAdminAccessGuard()

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 60px)',
          width: '100%'
        }}
      >
        <Loader size="xl" />
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <main>
      <AdminProjectList />
    </main>
  )
}
