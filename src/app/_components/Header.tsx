'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Text } from '@mantine/core'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { notifications } from '@mantine/notifications'
import { signOut } from '@/serverActions/supabaseAuth'
import UserProfile from './UserProfile'
import { clientApi } from '~/lib/trpc/client-api'

export const Header = () => {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [userName, setUserName] = useState<string | null>(null)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [opened, setOpened] = useState(false)
  const { data: user } = clientApi.user.whoami.useQuery()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUserName(session.user.user_metadata.name ?? 'ゲスト')
        setUserImage(session.user.user_metadata.avatar_url ?? null)
      }
    }
    getSession()
  }, [supabase.auth])

  // const handleLogout = async () => {
  //   try {
  //     await signOut()

  //     notifications.show({
  //       title: '成功',
  //       message: 'ログアウトに成功しました',
  //       color: 'green',
  //       autoClose: 3000,
  //       withBorder: true
  //     })

  //     router.push('/')
  //   } catch (error) {
  //     console.error('❌ ログアウトエラー:', error)
  //     notifications.show({
  //       title: 'エラー',
  //       message:
  //         error instanceof Error ? error.message : 'ログアウトに失敗しました',
  //       color: 'red',
  //       autoClose: 5000,
  //       withBorder: true
  //     })
  //   }
  // }

  return (
    <header
      style={{
        height: 60,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        zIndex: 1000,
        position: 'relative',
        marginBottom: '40px'
      }}
    >
      {/* 左側のタイトル */}
      <Text
        size="lg"
        fw={700}
        style={{
          cursor: 'pointer',
          color: '#2C3E50',
          letterSpacing: '0.5px'
        }}
        onClick={() => {
          if (user?.role === 'ADMIN') {
            router.push('/admin/projects')
          } else {
            router.push('/projects')
          }
        }}
      >
        Project Matching App
      </Text>
      <UserProfile />
    </header>
  )
}

export default Header
