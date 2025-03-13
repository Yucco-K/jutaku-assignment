'use client'

import { Menu, Avatar, Group, Text, ActionIcon } from '@mantine/core'
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { notifications } from '@mantine/notifications'
import { clientApi } from '~/lib/trpc/client-api'
import { signOut } from '@/serverActions/supabaseAuth'

export function UserProfile() {
  const router = useRouter()
  const { data: user, isLoading } = clientApi.user.whoami.useQuery()

  const handleLogout = async () => {
    try {
      await signOut()

      notifications.show({
        title: '成功',
        message: 'ログアウトに成功しました',
        color: 'green',
        autoClose: 3000,
        withBorder: true
      })

      router.push('/')
    } catch (error) {
      console.error('❌ ログアウトエラー:', error)
      notifications.show({
        title: 'エラー',
        message:
          error instanceof Error ? error.message : 'ログアウトに失敗しました',
        color: 'red',
        autoClose: 5000,
        withBorder: true
      })
    }
  }

  if (isLoading) return null
  if (!user) return null

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          variant="light"
          size="lg"
          radius="xl"
          color="blue.4"
          style={{
            background: 'linear-gradient(135deg, #6B8DE3 0%, #7B9FF7 100%)',
            transition: 'transform 0.2s ease',
            ':hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          <FaUserCircle size={32} color="white" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label
          style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #6B8DE3 0%, #7B9FF7 100%)',
            color: 'white',
            padding: '12px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Text fw={500} style={{ color: 'white' }}>
            {user.name || 'ゲスト'}
            {user.name?.toLowerCase() !== 'admin' && ' さん'}
          </Text>
        </Menu.Label>

        <Menu.Divider />

        <Menu.Item
          color="blue.4"
          onClick={handleLogout}
          style={{
            marginTop: '4px',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Group justify="center" w="100%">
            <FaSignOutAlt size={16} />
            ログアウト
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default UserProfile
