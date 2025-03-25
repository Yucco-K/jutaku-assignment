'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  Title,
  UnstyledButton,
  Group,
  Text,
  Loader,
  Badge,
  Select
} from '@mantine/core'
import { FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa'
import { clientApi } from '~/lib/trpc/client-api'
import BackButton from '../_components/BackButton'

const STATUS_OPTIONS = [
  { value: 'ALL', label: '全て' },
  { value: 'PENDING', label: '保留中' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'REJECTED', label: '却下' },
  { value: 'WITHDRAWN', label: '取り下げ' }
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge color="yellow">保留中</Badge>
    case 'APPROVED':
      return <Badge color="green">承認済み</Badge>
    case 'REJECTED':
      return <Badge color="red">却下</Badge>
    case 'WITHDRAWN':
      return <Badge color="red">取り下げ</Badge>
    default:
      return <Badge>不明</Badge>
  }
}

// エントリーの型定義
type EntryStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
type EntryType = {
  project?: { title: string; price?: number } | null
  status: EntryStatus
  project_id: string
  user_id: string
  entry_date: string
}

export default function EntryList() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'date' | 'price' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedStatus, setSelectedStatus] = useState<EntryStatus | 'ALL'>(
    'ALL'
  )

  // tRPCを使用してエントリー一覧を取得（ログインユーザーのみ）
  const { data: entries = [], isLoading } = clientApi.entry.list.useQuery({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus
  }) as { data: EntryType[]; isLoading: boolean }

  // ソート済みエントリーを計算
  const sortedEntries = useMemo(() => {
    if (!sortBy) return entries
    return [...entries].sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
          : new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      }
      return sortDirection === 'asc'
        ? (a.project?.price || 0) - (b.project?.price || 0)
        : (b.project?.price || 0) - (a.project?.price || 0)
    })
  }, [entries, sortBy, sortDirection])

  // ソート関数
  const sortData = (field: 'date' | 'price') => {
    const isAsc = sortBy === field && sortDirection === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'
    setSortBy(field)
    setSortDirection(newDirection)
  }

  const getSortIcon = (field: 'date' | 'price') => {
    if (sortBy !== field) return <FaSort size={14} />
    return sortDirection === 'asc' ? (
      <FaSortUp size={14} />
    ) : (
      <FaSortDown size={14} />
    )
  }

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

  return (
    <>
      <Title
        order={2}
        style={{
          textAlign: 'center',
          color: '#5a5a5a',
          marginTop: '48px',
          marginBottom: '48px',
          letterSpacing: '0.5px'
        }}
      >
        エントリー済み一覧
      </Title>

      <BackButton />

      <div
        style={{
          maxWidth: '1000px',
          margin: '32px auto',
          padding: '0 20px'
        }}
      >
        <Group justify="flex-end" mb="xl">
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
      </div>

      <div className="table-container" style={{ marginBottom: '48px' }}>
        <Table
          style={{
            width: '100%',
            maxWidth: '1000px',
            margin: 'auto',
            borderCollapse: 'collapse',
            border: '1px solid #e0e0e0'
          }}
        >
          <Table.Thead>
            <Table.Tr style={{ backgroundColor: '#E3F2FD' }}>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '120px',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                <UnstyledButton onClick={() => sortData('date')}>
                  <Group justify="center" gap="xs">
                    <Text size="md">エントリー日</Text>
                    {getSortIcon('date')}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '400px',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                <Text size="md">案件名</Text>
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '120px',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                <UnstyledButton onClick={() => sortData('price')}>
                  <Group justify="center" gap="xs">
                    <Text size="md">単価</Text>
                    {getSortIcon('price')}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '120px',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                <Text size="md">ステータス</Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedEntries.length > 0 ? (
              sortedEntries.map((entry) => (
                <Table.Tr key={`${entry.project_id}_${entry.user_id}`}>
                  <Table.Td
                    style={{
                      textAlign: 'center',
                      border: '1px solid #e0e0e0',
                      padding: '16px',
                      lineHeight: '1.6'
                    }}
                  >
                    {formatDate(entry.entry_date)}
                  </Table.Td>
                  <Table.Td
                    style={{
                      textAlign: 'center',
                      border: '1px solid #e0e0e0',
                      padding: '16px',
                      lineHeight: '1.6'
                    }}
                  >
                    {entry.project?.title || '不明'}
                  </Table.Td>
                  <Table.Td
                    style={{
                      textAlign: 'center',
                      border: '1px solid #e0e0e0',
                      padding: '16px',
                      lineHeight: '1.6'
                    }}
                  >
                    {entry.project?.price
                      ? `${entry.project.price.toLocaleString()}円`
                      : '未設定'}
                  </Table.Td>
                  <Table.Td
                    style={{
                      textAlign: 'center',
                      border: '1px solid #e0e0e0',
                      padding: '16px'
                    }}
                  >
                    {getStatusDisplay(entry.status)}
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    marginBottom: '48px'
                  }}
                >
                  エントリーはありません
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>
    </>
  )
}
