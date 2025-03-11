'use client'
import { signOut } from '@/serverActions/supabaseAuth'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'

const LogoutButton = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser() // ユーザー情報取得
      const role = user?.user_metadata?.role // ユーザーの role を取得

      const result = await signOut()

      notifications.show({
        title: '成功',
        message: result.message,
        color: 'green',
        autoClose: 3000,
        withBorder: true
      })

      setTimeout(() => {
        if (role === 'ADMIN') {
          router.push('/admin/signin')
        } else {
          router.push('/')
        }
      }, 3000)
    } catch (error) {
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

  return <button onClick={handleLogout}>ログアウト</button>
}

export default LogoutButton
