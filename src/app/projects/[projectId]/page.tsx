'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { EntryStatus } from '@prisma/client'
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Modal,
  Group,
  Loader,
  Table
} from '@mantine/core'
import { clientApi } from '~/lib/trpc/client-api'
import BackButton from '@/app/_components/BackButton'
import { supabase } from '~/lib/supabase/browser'
import { useQueryClient } from '@tanstack/react-query'

// 日付フォーマット用のヘルパー関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

// 単価フォーマット用のヘルパー関数
const formatPrice = (price: number) => {
  return `${price.toLocaleString()}円`
}

const ENTRY_STATUS = {
  WITHDRAWN: EntryStatus.WITHDRAWN,
  PENDING: EntryStatus.PENDING,
  APPROVED: EntryStatus.APPROVED,
  REJECTED: EntryStatus.REJECTED
} satisfies Record<string, EntryStatus>

export default function ProjectDetail() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const [modalOpened, setModalOpened] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [buttonCooldown, setButtonCooldown] = useState(false)
  const [entryStatus, setEntryStatus] = useState<EntryStatus | null>(null)

  // ボタンのクールダウンを設定
  const setButtonCooldownTimer = () => {
    setIsButtonDisabled(true)
    setButtonCooldown(true)
    setTimeout(() => {
      setIsButtonDisabled(false)
      setButtonCooldown(false)
    }, 3000) // 3秒間のクールダウン
  }

  // ユーザー情報を取得
  const { data: user, isLoading: isUserLoading } =
    clientApi.user.whoami.useQuery()
  const [userId, setUserId] = useState<string | null>(null)

  // ユーザー情報が取得できたらuserIdを設定
  useEffect(() => {
    if (user) {
      setUserId(user.id)
    }
  }, [user])

  // 認証状態の変更を監視
  useEffect(() => {
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event, session?.user?.id)
        if (session?.user) {
          setUserId(session.user.id)
        } else {
          setUserId(null)
        }
      }
    )

    return () => {
      authSubscription?.subscription.unsubscribe()
    }
  }, [])

  // 認証状態に基づいてボタンの表示を制御
  const isAuthenticated = !!user

  // tRPCを使用してプロジェクトデータを取得
  const { data: project, isLoading } = clientApi.project.find.useQuery<{
    id: string
    title: string
    description: string | null
    price: number | null
    deadline: string | null
    created_at: string
    creator_id: string
    skills: Array<{ skill: { id: string; name: string } }>
  }>(params?.projectId as string, {
    enabled: !!params?.projectId,
    staleTime: 0, // キャッシュを無効化
    cacheTime: 0, // キャッシュを無効化
    refetchOnMount: true, // マウント時に再取得
    refetchOnReconnect: true // 再接続時に再取得
  })

  // 現在のエントリー状態を取得
  const { data: currentEntry, refetch: refetchEntry } =
    clientApi.entry.find.useQuery(
      {
        project_id: params?.projectId as string,
        user_id: userId ?? ''
      },
      {
        enabled: !!userId && !!params?.projectId,
        refetchOnWindowFocus: false,
        staleTime: 0, // キャッシュを無効化
        cacheTime: 0, // キャッシュを無効化
        refetchOnMount: true, // マウント時に再取得
        refetchOnReconnect: true, // 再接続時に再取得
        retry: false,
        onSuccess: (data) => {
          if (data) {
            setEntryStatus(data.status)
          } else {
            setEntryStatus(null)
          }
        }
      }
    )

  // コンポーネントマウント時にキャッシュをクリア
  useEffect(() => {
    const clearCache = async () => {
      // すべてのキャッシュをクリア
      await queryClient.clear()
      // 特定のクエリキーを無効化
      queryClient.invalidateQueries(['entry'])
      queryClient.invalidateQueries(['project'])
      // 強制的に再取得
      await refetchEntry()
    }
    clearCache()
  }, [queryClient, refetchEntry])

  // エントリー作成のミューテーション
  const entryMutation = clientApi.entry.create.useMutation({
    onSuccess: async () => {
      await refetchEntry()
      setEntryStatus(ENTRY_STATUS.PENDING)
      setModalMessage('エントリーしました。')
      setModalOpened(true)
    },
    onError: (error) => {
      console.error('エントリー作成エラー:', error)
      setModalMessage('エラーが発生しました。時間をおいて再度お試しください。')
      setModalOpened(true)
    }
  })

  // エントリー更新のミューテーション
  const updateEntryMutation = clientApi.entry.update.useMutation({
    onSuccess: async () => {
      await refetchEntry()
      // ステータスを更新
      if (currentEntry) {
        setEntryStatus(
          currentEntry.status === ENTRY_STATUS.PENDING
            ? ENTRY_STATUS.WITHDRAWN
            : ENTRY_STATUS.PENDING
        )
      }
      setModalMessage('エントリーのステータスを更新しました。')
      setModalOpened(true)
    },
    onError: (error) => {
      console.error('エントリー更新エラー:', error)
      setModalMessage('エラーが発生しました。時間をおいて再度お試しください。')
      setModalOpened(true)
    }
  })

  // エントリーボタンのクリックハンドラー
  const handleEntryToggle = async () => {
    if (!isAuthenticated) {
      setModalMessage('ログインが必要です。')
      setModalOpened(true)
      return
    }

    if (buttonCooldown || isButtonDisabled) {
      setModalMessage('操作は3秒後に再度お試しください。')
      setModalOpened(true)
      return
    }

    const currentUserId = user?.id
    if (!currentUserId) {
      setModalMessage('ユーザー情報の取得に失敗しました。')
      setModalOpened(true)
      return
    }

    if (!project?.id) {
      setModalMessage('プロジェクト情報の取得に失敗しました。')
      setModalOpened(true)
      return
    }

    try {
      setButtonCooldownTimer()

      // 最新のエントリー状態を取得（userIdが存在する場合のみ）
      if (userId) {
        await refetchEntry()
      }

      // 既存のエントリーの有無を確認
      if (currentEntry) {
        // 既存のエントリーがある場合は更新のみ実行
        switch (currentEntry.status) {
          case ENTRY_STATUS.PENDING:
            // 保留中の場合は取り下げに変更
            await updateEntryMutation.mutateAsync({
              project_id: project.id,
              user_id: currentUserId,
              status: ENTRY_STATUS.WITHDRAWN
            })
            break

          case ENTRY_STATUS.WITHDRAWN:
            // 取り下げ状態の場合は保留中に変更
            await updateEntryMutation.mutateAsync({
              project_id: project.id,
              user_id: currentUserId,
              status: ENTRY_STATUS.PENDING
            })
            break

          case ENTRY_STATUS.APPROVED:
          case ENTRY_STATUS.REJECTED:
            // 承認済みまたは却下済みの場合は操作不可
            setModalMessage('このステータスでは操作できません')
            setModalOpened(true)
            break

          default:
            setModalMessage('不正なステータスです')
            setModalOpened(true)
            break
        }
      } else {
        // 新規エントリー作成
        await entryMutation.mutateAsync({
          project_id: project.id,
          status: ENTRY_STATUS.PENDING,
          entry_date: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('エントリー処理でエラーが発生しました:', error)
      setModalMessage('エラーが発生しました。時間をおいて再度お試しください。')
      setModalOpened(true)
    }
  }

  // ステータスに応じたボタンのラベルを取得
  const getButtonLabel = (status: EntryStatus | null) => {
    if (!isAuthenticated) return 'ログインが必要です'
    if (buttonCooldown) return '処理中...'

    // 現在のステータスに応じてラベルを切り替え
    if (!status) {
      return 'この案件にエントリーする' // エントリーが存在しない場合
    }

    switch (status) {
      case ENTRY_STATUS.PENDING:
        return 'エントリーを取り下げる' // 保留中の場合は取り下げ操作を表示
      case ENTRY_STATUS.WITHDRAWN:
        return '再度エントリーする' // 取り下げ状態の場合は再エントリーを表示
      case ENTRY_STATUS.APPROVED:
        return '承認済み' // 承認済みの場合は操作不可
      case ENTRY_STATUS.REJECTED:
        return '却下済み' // 却下済みの場合は操作不可
      default:
        return 'この案件にエントリーする' // 初回エントリー時の表示
    }
  }

  // ステータスに応じたボタンの色を取得
  const getButtonColor = (status: EntryStatus | null) => {
    if (buttonCooldown) return 'gray'
    if (!status) return 'blue'
    switch (status) {
      case ENTRY_STATUS.PENDING:
        return 'red' // 保留中は取り下げ可能なので赤色
      case ENTRY_STATUS.WITHDRAWN:
        return 'blue' // 取り下げ状態は再エントリー可能なので青色
      default:
        return 'blue' // その他の状態は青色
    }
  }

  // ステータスに応じたボタンの無効化状態を取得
  const isButtonDisabledByStatus = (status: EntryStatus | null) => {
    if (!isAuthenticated) return true
    if (buttonCooldown) return true
    if (!status) return false
    // 承認済みまたは却下済みの場合はボタンを無効化
    return status === ENTRY_STATUS.APPROVED || status === ENTRY_STATUS.REJECTED
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 60px)',
          width: '100%',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <Loader size="xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Text>プロジェクトが見つかりません</Text>
      </div>
    )
  }

  return (
    <>
      <Title
        order={2}
        style={{
          textAlign: 'center',
          color: '#5a5a5a',
          marginBottom: '48px',
          letterSpacing: '0.5px'
        }}
      >
        案件詳細
      </Title>

      <BackButton />

      <Card
        shadow="sm"
        padding="xl"
        withBorder
        style={{ maxWidth: '700px', margin: 'auto', marginBottom: '48px' }}
      >
        <Stack gap="xl">
          <div style={{ marginBottom: '24px' }}>
            <Text fw="bold" mb={12} size="lg">
              案件作成日
            </Text>
            <Text ml="sm" size="md">
              {formatDate(project.created_at)}
            </Text>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <Text fw="bold" mb={12} size="lg">
              案件名
            </Text>
            <Text ml="sm" size="md">
              {project.title}
            </Text>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <Text fw="bold" mb={12} size="lg">
              概要
            </Text>
            <Text ml="sm" size="md" style={{ lineHeight: '1.8' }}>
              {project.description}
            </Text>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <Text fw="bold" mb={12} size="lg">
              必要スキル
            </Text>
            <Text ml="sm" size="md" style={{ lineHeight: '1.8' }}>
              {project.skills.map((s) => s.skill.name).join(', ')}
            </Text>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <Text fw="bold" mb={12} size="lg">
              募集締切日
            </Text>
            <Text ml="sm" size="md">
              {project.deadline ? formatDate(project.deadline) : '未設定'}
            </Text>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <Text fw="bold" mb={12} size="lg">
              単価
            </Text>
            <Text ml="sm" size="md">
              {project.price ? formatPrice(project.price) : '未設定'}
            </Text>
          </div>

          <Text
            size="sm"
            c="dimmed"
            mb={16}
            ta="center"
            style={{ lineHeight: '1.6' }}
          >
            ※エントリーのステータスを取り下げに変更できるのは、保留中の時のみです
          </Text>

          {/* エントリーボタンの表示制御 */}
          <div>
            {currentEntry && (
              <Text
                size="md"
                ta="center"
                fw="bold"
                mb={16}
                style={{ letterSpacing: '0.5px' }}
              >
                現在のステータス：
                {(() => {
                  switch (currentEntry.status) {
                    case ENTRY_STATUS.PENDING:
                      return '保留中'
                    case ENTRY_STATUS.APPROVED:
                      return '承認済み'
                    case ENTRY_STATUS.REJECTED:
                      return '却下'
                    case ENTRY_STATUS.WITHDRAWN:
                      return '取下げ'
                    default:
                      return '不明'
                  }
                })()}
              </Text>
            )}

            <Button
              color={getButtonColor(entryStatus)}
              fullWidth
              onClick={handleEntryToggle}
              loading={entryMutation.isLoading || updateEntryMutation.isLoading}
              disabled={
                isButtonDisabledByStatus(entryStatus) || isButtonDisabled
              }
              mt={8}
              size="lg"
              style={{ letterSpacing: '0.5px' }}
            >
              {getButtonLabel(entryStatus)}
            </Button>
          </div>
        </Stack>

        <Modal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false)
            if (modalMessage.includes('成功')) {
              router.push('/entry-list')
            }
          }}
          centered
          styles={{
            overlay: {
              zIndex: 1001
            },
            inner: {
              zIndex: 1002
            },
            content: {
              zIndex: 1002
            },
            header: {
              justifyContent: 'center'
            },
            title: {
              width: '100%',
              textAlign: 'center'
            }
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: '1.1rem',
              lineHeight: '1.8'
            }}
          >
            {modalMessage}
          </Text>
          <Group justify="center" mt="xl">
            <Button
              fullWidth
              onClick={() => {
                setModalOpened(false)
                if (modalMessage.includes('成功')) {
                  router.push('/entry-list')
                }
              }}
              size="md"
              style={{ letterSpacing: '0.5px' }}
            >
              OK
            </Button>
          </Group>
        </Modal>
      </Card>
    </>
  )
}
