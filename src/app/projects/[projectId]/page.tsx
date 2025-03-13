'use client'
import React, { useState } from 'react'
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
  Loader
} from '@mantine/core'
import { clientApi } from '~/lib/trpc/client-api'
import BackButton from '@/app/_components/BackButton'

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
  const [modalOpened, setModalOpened] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  // ユーザー情報を取得
  const { data: currentUser } = clientApi.user.whoami.useQuery()
  const userId = currentUser?.id ?? ''

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
  }>(params?.projectId as string)

  // 現在のエントリー状態を取得
  const { data: currentEntry, refetch: refetchEntry } =
    clientApi.entry.find.useQuery(
      {
        project_id: params?.projectId as string,
        user_id: userId
      },
      {
        enabled: !!userId && !!params?.projectId,
        refetchOnWindowFocus: true
      }
    )

  // エントリー作成のミューテーション
  const entryMutation = clientApi.entry.create.useMutation({
    onSuccess: async () => {
      await refetchEntry()
      setModalMessage('エントリーしました。')
      setModalOpened(true)
    },
    onError: (error) => {
      console.error('エントリーエラー:', error)
      setModalMessage(
        'エントリーに失敗しました。時間をおいて再度お試しください。'
      )
      setModalOpened(true)
    }
  })

  // エントリー更新のミューテーション
  const updateEntryMutation = clientApi.entry.update.useMutation({
    onSuccess: async () => {
      await refetchEntry()
      setModalMessage('エントリーのステータスを更新しました。')
      setModalOpened(true)
    },
    onError: (error) => {
      console.error('エントリー更新エラー:', error)
      setModalMessage(
        'ステータスの更新に失敗しました。時間をおいて再度お試しください。'
      )
      setModalOpened(true)
    }
  })

  // エントリーボタンのクリックハンドラー
  const handleEntry = async () => {
    if (!project?.id || !userId) return

    try {
      // 既存のエントリーがある場合は更新、ない場合は新規作成
      if (currentEntry?.status === ENTRY_STATUS.WITHDRAWN) {
        await updateEntryMutation.mutateAsync({
          project_id: project.id,
          user_id: userId,
          status: ENTRY_STATUS.PENDING
        })
      } else if (!currentEntry) {
        await entryMutation.mutateAsync({
          project_id: project.id,
          status: ENTRY_STATUS.PENDING
        })
      }
    } catch (error) {
      console.error('エントリー処理でエラーが発生しました:', error)
    }
  }

  // 取り下げボタンのクリックハンドラー
  const handleWithdraw = async () => {
    if (!project?.id || !userId || !currentEntry) return

    // PENDINGステータスの場合のみ取り下げ可能
    if (currentEntry.status !== ENTRY_STATUS.PENDING) {
      setModalMessage('保留中のエントリーのみ取り下げ可能です。')
      setModalOpened(true)
      return
    }

    try {
      await updateEntryMutation.mutateAsync({
        project_id: project.id,
        user_id: userId,
        status: ENTRY_STATUS.WITHDRAWN
      })
    } catch (error) {
      console.error('取り下げ処理でエラーが発生しました:', error)
    }
  }

  // ステータスに応じたボタンのラベルを取得
  const getButtonLabel = (status?: EntryStatus) => {
    switch (status) {
      case ENTRY_STATUS.PENDING:
        return 'エントリーを取り下げる'
      case ENTRY_STATUS.WITHDRAWN:
        return '再度エントリーする'
      case ENTRY_STATUS.APPROVED:
        return '承認済み'
      case ENTRY_STATUS.REJECTED:
        return '却下済み'
      default:
        return 'この案件にエントリーする'
    }
  }

  // ステータスに応じたボタンの色を取得
  const getButtonColor = (status?: EntryStatus) => {
    switch (status) {
      case ENTRY_STATUS.PENDING:
        return 'red'
      case ENTRY_STATUS.WITHDRAWN:
        return 'blue'
      default:
        return 'blue'
    }
  }

  // ステータスに応じたボタンのクリックハンドラーを取得
  const getButtonHandler = (status?: EntryStatus) => {
    switch (status) {
      case ENTRY_STATUS.PENDING:
        return handleWithdraw
      case ENTRY_STATUS.WITHDRAWN:
        return handleEntry
      default:
        return handleEntry
    }
  }

  // ステータスに応じたボタンの無効化状態を取得
  const isButtonDisabled = (status?: EntryStatus) => {
    return status === ENTRY_STATUS.APPROVED || status === ENTRY_STATUS.REJECTED
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Loader size="xl" color="blue" />
        <Text mt="md">データを読み込んでいます...</Text>
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
          marginBottom: '32px'
        }}
      >
        案件詳細
      </Title>

      <BackButton />

      <Card
        shadow="sm"
        padding="lg"
        withBorder
        style={{ maxWidth: '700px', margin: 'auto' }}
      >
        <Stack gap="lg">
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              案件作成日
            </Text>
            <Text ml="sm">{formatDate(project.created_at)}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              案件名
            </Text>
            <Text ml="sm">{project.title}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              概要
            </Text>
            <Text ml="sm">{project.description}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              必要スキル
            </Text>
            <Text ml="sm">
              {project.skills.map((s) => s.skill.name).join(', ')}
            </Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              募集締切日
            </Text>
            <Text ml="sm">
              {project.deadline ? formatDate(project.deadline) : '未設定'}
            </Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              単価
            </Text>
            <Text ml="sm">
              {project.price ? formatPrice(project.price) : '未設定'}
            </Text>
          </div>

          <Text size="sm" c="dimmed" mb={8} ta="center">
            ※エントリーのステータスを取り下げに変更できるのは、保留中の時のみです
          </Text>

          {/* エントリーボタンの表示制御 */}
          <div>
            {currentEntry && (
              <Text size="sm" ta="center" fw="bold" mb={8}>
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
              color={getButtonColor(currentEntry?.status)}
              fullWidth
              onClick={getButtonHandler(currentEntry?.status)}
              loading={entryMutation.isLoading || updateEntryMutation.isLoading}
              disabled={isButtonDisabled(currentEntry?.status)}
              mt={8}
            >
              {getButtonLabel(currentEntry?.status)}
            </Button>

            {isButtonDisabled(currentEntry?.status) && (
              <Text size="sm" c="dimmed" ta="center" mt={8}>
                このステータスでは操作できません
              </Text>
            )}
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
        >
          <Text style={{ textAlign: 'center' }}>{modalMessage}</Text>
          <Group justify="center" mt="md">
            <Button
              fullWidth
              onClick={() => {
                setModalOpened(false)
                if (modalMessage.includes('成功')) {
                  router.push('/entry-list')
                }
              }}
            >
              OK
            </Button>
          </Group>
        </Modal>
      </Card>
    </>
  )
}
