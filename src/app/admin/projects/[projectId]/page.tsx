'use client'
import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { RouteLiteral } from 'nextjs-routes'
import type { EntryStatus } from '@prisma/client'
import {
  Button,
  Title,
  Text,
  Group,
  Modal,
  Table,
  Loader,
  Select
} from '@mantine/core'
import { clientApi } from '~/lib/trpc/client-api'
import BackButton from '@/app/_components/BackButton'
import ActionButtons from '@/app/_component/ActionButtons'
import { FaFilter } from 'react-icons/fa'

const STATUS_OPTIONS = [
  { value: 'ALL', label: '全て' },
  { value: 'PENDING', label: '保留中' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'REJECTED', label: '却下' },
  { value: 'WITHDRAWN', label: '取り下げ' }
]

const STATUS_LABELS: Record<EntryStatus, string> = {
  PENDING: '保留中',
  APPROVED: '承認済み',
  REJECTED: '却下',
  WITHDRAWN: '取下げ'
}

const SELECTABLE_STATUSES = [
  { value: 'PENDING', label: '保留中' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'REJECTED', label: '却下' }
]

export default function AdminProjectDetail() {
  const router = useRouter()
  const params = useParams()
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [entryModalOpened, setEntryModalOpened] = useState(false)
  const [confirmModalOpened, setConfirmModalOpened] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<{
    id: string
    status: EntryStatus
  } | null>(null)
  const [newStatus, setNewStatus] = useState<EntryStatus | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<EntryStatus | 'ALL'>(
    'ALL'
  )

  // プロジェクト詳細を取得
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

  // エントリー一覧を取得
  const {
    data: entries = [],
    refetch: refetchEntries,
    error: entriesError
  } = clientApi.entry.findMany.useQuery<
    {
      id: string
      status: EntryStatus
      project_id: string
      user_id: string
      entry_date: string
      user: { id: string; name: string }
    }[]
  >({
    projectId: params?.projectId as string
  })

  // フィルタリングされたエントリーを取得
  const filteredEntries =
    selectedStatus === 'ALL'
      ? entries
      : entries.filter((entry) => entry.status === selectedStatus)

  // プロジェクト削除のミューテーション
  const deleteMutation = clientApi.project.delete.useMutation({
    onSuccess: () => {
      setDeleteModalOpened(false)
      router.push('/admin/projects')
    }
  })

  // 編集ボタンのクリックハンドラ
  const handleEdit = () => {
    if (params?.projectId) {
      router.push(`/admin/projects/${params.projectId}/edit` as RouteLiteral)
    }
  }

  // 削除ボタンのクリックハンドラ
  const handleDelete = () => {
    if (typeof params?.projectId === 'string') {
      deleteMutation.mutate(params.projectId)
    }
  }

  // 戻るボタンのクリックハンドラ
  const handleBack = () => {
    router.push('/admin/projects')
  }

  // エントリーステータス更新のミューテーション
  const updateEntryMutation = clientApi.entry.update.useMutation({
    onSuccess: () => {
      setConfirmModalOpened(false)
      setSelectedEntry(null)
      setNewStatus(null)
      setErrorMessage('')
      // エントリー一覧を再取得
      refetchEntries()
    },
    onError: (error) => {
      console.error('エントリー更新エラー:', error)
      setErrorMessage(
        'ステータスの更新に失敗しました。時間をおいて再度お試しください。'
      )
    }
  })

  const handleStatusChange = (
    entryId: string,
    currentStatus: EntryStatus,
    newStatusValue: string
  ) => {
    setSelectedEntry({ id: entryId, status: currentStatus })
    setNewStatus(newStatusValue as EntryStatus)
    setConfirmModalOpened(true)
  }

  const handleStatusUpdate = async () => {
    if (!selectedEntry || !newStatus) return

    try {
      const entry = entries.find((e) => e.id === selectedEntry.id)
      if (!entry) return

      await updateEntryMutation.mutateAsync({
        project_id: entry.project_id,
        user_id: entry.user_id,
        status: newStatus
      })
    } catch (error) {
      console.error('ステータス更新エラー:', error)
    }
  }

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
      >
        <Loader size="xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Text>案件が見つかりません</Text>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Text color="red">{errorMessage}</Text>
        <Button onClick={() => router.push('/admin/signin')} mt="md">
          管理者ログインページへ
        </Button>
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
          marginTop: '32px',
          marginBottom: '60px'
        }}
      >
        案件詳細
      </Title>

      <BackButton />

      <Table style={{ maxWidth: '700px', margin: '60px auto' }}>
        <Table.Tbody>
          {[
            ['案件名', project.title],
            ['概要', project.description || ''],
            [
              '必要スキル',
              project.skills?.map((s) => s.skill.name).join(', ') || ''
            ],
            [
              '募集締切日',
              project.deadline
                ? new Date(project.deadline)
                    .toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })
                    .replace(/\u200E/g, '')
                    .split('/')
                    .join('/')
                : ''
            ],
            [
              '単価',
              project.price
                ? `${new Intl.NumberFormat('ja-JP').format(project.price)}円`
                : ''
            ]
          ].map(([label, value]) => (
            <Table.Tr key={label}>
              <Table.Th
                style={{
                  backgroundColor: '#E3F2FD',
                  textAlign: 'center',
                  width: '30%',
                  padding: '20px'
                }}
              >
                {label}
              </Table.Th>
              <Table.Td style={{ textAlign: 'center', padding: '20px' }}>
                {value}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <ActionButtons
        handleEdit={handleEdit}
        setEntryModalOpened={setEntryModalOpened}
        setDeleteModalOpened={setDeleteModalOpened}
      />

      <Modal
        opened={entryModalOpened}
        onClose={() => setEntryModalOpened(false)}
        title="エントリー 一覧"
        centered
        size="lg"
      >
        {errorMessage && (
          <Text style={{ color: 'red', textAlign: 'center' }} mb="md">
            {errorMessage}
          </Text>
        )}
        <Group justify="flex-end" mb="md">
          <Select
            value={selectedStatus}
            onChange={(value) =>
              setSelectedStatus((value || 'ALL') as EntryStatus | 'ALL')
            }
            data={STATUS_OPTIONS}
            label="ステータスでフィルター"
            leftSection={<FaFilter />}
            style={{ width: '200px' }}
          />
        </Group>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>エントリー者</Table.Th>
              <Table.Th>ステータス</Table.Th>
              {filteredEntries.some(
                (entry) => entry.status !== 'WITHDRAWN'
              ) && <Table.Th>操作</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <Table.Tr key={entry.id}>
                  <Table.Td>{entry.user.name}</Table.Td>
                  <Table.Td>{STATUS_LABELS[entry.status]}</Table.Td>
                  {filteredEntries.some((e) => e.status !== 'WITHDRAWN') && (
                    <Table.Td>
                      {entry.status !== 'WITHDRAWN' && (
                        <>
                          {entry.status !== 'APPROVED' &&
                            entry.status !== 'REJECTED' && (
                              <Select
                                value={entry.status}
                                onChange={(value) =>
                                  handleStatusChange(
                                    entry.id,
                                    entry.status,
                                    value as string
                                  )
                                }
                                data={SELECTABLE_STATUSES}
                                placeholder="ステータスを選択"
                              />
                            )}
                          {(entry.status === 'APPROVED' ||
                            entry.status === 'REJECTED') && (
                            <Text size="sm" c="dimmed">
                              ステータス変更不可
                            </Text>
                          )}
                        </>
                      )}
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={
                    filteredEntries.some((e) => e.status !== 'WITHDRAWN')
                      ? 3
                      : 2
                  }
                  style={{ textAlign: 'center' }}
                >
                  エントリーはありません
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Modal>

      <Modal
        opened={confirmModalOpened}
        onClose={() => {
          setConfirmModalOpened(false)
          setSelectedEntry(null)
          setNewStatus(null)
        }}
        title="ステータス変更の確認"
        centered
      >
        <Text
          style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '40px' }}
          mb="xl"
        >
          ステータスを{' '}
          {selectedEntry && (
            <strong>{STATUS_LABELS[selectedEntry.status]}</strong>
          )}{' '}
          から {newStatus && <strong>{STATUS_LABELS[newStatus]}</strong>}{' '}
          に変更してよろしいですか？
        </Text>
        <Group justify="center" mt="xl">
          <Button
            color="blue"
            onClick={handleStatusUpdate}
            loading={updateEntryMutation.isLoading}
          >
            OK
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setConfirmModalOpened(false)
              setSelectedEntry(null)
              setNewStatus(null)
            }}
          >
            キャンセル
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        centered
      >
        <Text
          style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '40px' }}
        >
          この案件を削除しますか？
        </Text>
        <Group justify="center" gap="sm" mt="xl">
          <Button
            color="red"
            onClick={handleDelete}
            loading={deleteMutation.isLoading}
          >
            はい
          </Button>
          <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
            いいえ
          </Button>
        </Group>
      </Modal>
    </>
  )
}
