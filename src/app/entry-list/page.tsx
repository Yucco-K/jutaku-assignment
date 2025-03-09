'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  Button,
  Title,
  UnstyledButton,
  Group,
  Text,
  Loader
} from '@mantine/core'
import { IconArrowUp, IconArrowDown, IconSelector } from '@tabler/icons-react'
import useEntryStore from '@/store/entryStore'

export default function EntryList() {
  const router = useRouter()
  const { entries, loadEntries } = useEntryStore()
  const [sortBy, setSortBy] = useState<'date' | 'price' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortedEntries, setSortedEntries] = useState(entries)

  // 初回レンダリング時にエントリーデータを読み込む
  useEffect(() => {
    loadEntries()
  }, [])

  // エントリーが変更されたらソート済みリストを更新
  useEffect(() => {
    setSortedEntries(entries)
  }, [entries])

  // ソート関数
  const sortData = (field: 'date' | 'price') => {
    const isAsc = sortBy === field && sortDirection === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'
    setSortBy(field)
    setSortDirection(newDirection)

    const sortedList = [...entries].sort((a, b) => {
      if (field === 'date') {
        return isAsc
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date)
      }
      return isAsc
        ? Number(a.price) - Number(b.price)
        : Number(b.price) - Number(a.price)
    })

    setSortedEntries(sortedList)
  }

  return (
    <>
      <Title
        order={2}
        style={{
          textAlign: 'center',
          color: '#5a5a5a',
          marginTop: '32px',
          marginBottom: '32px'
        }}
      >
        エントリー済み一覧
      </Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '20px',
          padding: '0 20px',
          maxWidth: '1200px',
          margin: '0 auto 20px'
        }}
      >
        <Button
          color="blue"
          size="sm"
          className="nav-link"
          style={{
            width: 'auto',
            minWidth: '200px',
            marginRight: '20px'
          }}
          onClick={() => router.back()}
        >
          戻る
        </Button>
      </div>

      <div className="table-container">
        <Table
          style={{
            width: '100%',
            maxWidth: '1200px',
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
                  padding: '12px'
                }}
              >
                <UnstyledButton onClick={() => sortData('date')}>
                  <Group justify="center" gap="xs">
                    <Text>エントリー日</Text>
                    {sortBy === 'date' ? (
                      sortDirection === 'asc' ? (
                        <IconArrowUp size={16} />
                      ) : (
                        <IconArrowDown size={16} />
                      )
                    ) : (
                      <IconSelector size={16} />
                    )}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '400px',
                  border: '1px solid #e0e0e0',
                  padding: '12px'
                }}
              >
                案件名
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '120px',
                  border: '1px solid #e0e0e0',
                  padding: '12px'
                }}
              >
                <UnstyledButton onClick={() => sortData('price')}>
                  <Group justify="center" gap="xs">
                    <Text>単価</Text>
                    {sortBy === 'price' ? (
                      sortDirection === 'asc' ? (
                        <IconArrowUp size={16} />
                      ) : (
                        <IconArrowDown size={16} />
                      )
                    ) : (
                      <IconSelector size={16} />
                    )}
                  </Group>
                </UnstyledButton>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedEntries.map((entry) => (
              <Table.Tr key={entry.id} style={{ textAlign: 'center' }}>
                <Table.Td
                  style={{
                    width: '160px',
                    border: '1px solid #e0e0e0',
                    padding: '12px'
                  }}
                >
                  {new Date(entry.date).toLocaleDateString()}
                </Table.Td>
                <Table.Td
                  style={{
                    width: '400px',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    border: '1px solid #e0e0e0',
                    padding: '12px'
                  }}
                >
                  {entry.name}
                </Table.Td>
                <Table.Td
                  style={{
                    width: '120px',
                    border: '1px solid #e0e0e0',
                    padding: '12px'
                  }}
                >
                  {entry.price}円
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </>
  )
}
