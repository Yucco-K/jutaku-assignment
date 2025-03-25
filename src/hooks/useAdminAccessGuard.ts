'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notifications } from '@mantine/notifications'
import { clientApi } from '~/lib/trpc/client-api'

export const useAdminAccessGuard = () => {
  const router = useRouter()
  const { data: user, isLoading } = clientApi.user.whoami.useQuery()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (isLoading || hasRedirected) return

    if (!user) {
      router.push('/')
      setHasRedirected(true)
      return
    }

    if (user.role !== 'ADMIN') {
      notifications.show({
        title: 'アクセス拒否',
        message: 'このページは管理者のみアクセス可能です。',
        color: 'red'
      })
      router.push('/projects')
      setHasRedirected(true)
    }
  }, [user, isLoading, router, hasRedirected])

  return { user, isLoading }
}
