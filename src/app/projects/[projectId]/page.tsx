'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import useProjectStore from '@/store/projectStore'
import useEntryStore from '@/store/entryStore'

// 日付フォーマット用のヘルパー関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

// 単価フォーマット用のヘルパー関数
const formatPrice = (price: string) => {
  return `${Number(price).toLocaleString()}円`
}

export default function ProjectDetail() {
  const router = useRouter()
  const { projectId } = useParams() as { projectId: string }
  const { selectedProject, loadProjectById } = useProjectStore()
  const { addEntry } = useEntryStore()
  const [modalOpened, setModalOpened] = useState(false)

  // ✅ 初回ロード時にプロジェクトデータを取得
  useEffect(() => {
    if (projectId) {
      loadProjectById(projectId)
    }
  }, [projectId])

  // ✅ プロジェクトがまだロードされていない場合
  if (!selectedProject) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Loader size="xl" color="blue" />
        <Text mt="md">データを読み込んでいます...</Text>
      </div>
    )
  }

  const handleEntry = () => {
    addEntry({
      name: selectedProject.name,
      price: selectedProject.price,
      projectId: selectedProject.id
    })
    setModalOpened(true)
  }

  return (
    <>
      <Title
        order={2}
        style={{
          textAlign: 'center',
          color: '#5a5a5a',
          marginBottom: '24px'
        }}
      >
        案件詳細
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
            minWidth: '120px',
            marginRight: '220px'
          }}
          onClick={() => router.back()}
        >
          戻る
        </Button>
      </div>

      <Card
        shadow="sm"
        padding="lg"
        withBorder
        style={{ maxWidth: '600px', margin: 'auto' }}
      >
        <Stack gap="lg">
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              案件作成日
            </Text>
            <Text ml="sm">{formatDate(selectedProject.date)}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              案件名
            </Text>
            <Text ml="sm">{selectedProject.name}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              概要
            </Text>
            <Text ml="sm">{selectedProject.description}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              必要スキル
            </Text>
            <Text ml="sm">{selectedProject.skills.join(', ')}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              募集締切日
            </Text>
            <Text ml="sm">{formatDate(selectedProject.deadline)}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text fw="bold" mb={8}>
              単価
            </Text>
            <Text ml="sm">{formatPrice(selectedProject.price)}</Text>
          </div>

          <Button color="blue" fullWidth onClick={handleEntry} mt={16}>
            この案件にエントリーする
          </Button>
        </Stack>

        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          centered
        >
          <Text style={{ textAlign: 'center' }}>エントリーしました。</Text>
          <Group justify="center" mt="md">
            <Button fullWidth onClick={() => setModalOpened(false)}>
              OK
            </Button>
          </Group>
        </Modal>
      </Card>
    </>
  )
}
