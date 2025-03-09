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
          marginBottom: '32px'
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
        <Text fw="bold">案件作成日</Text>
        <Text ml="sm">{selectedProject.date}</Text>
        <Text fw="bold">案件名</Text>
        <Text ml="sm">{selectedProject.name}</Text>
        <Text fw="bold">概要</Text>
        <Text ml="sm">{selectedProject.description}</Text>
        <Text fw="bold">必要スキル</Text>
        <Text ml="sm">{selectedProject.skills.join(', ')}</Text>
        <Text fw="bold">募集締切日</Text>
        <Text ml="sm">{selectedProject.deadline}</Text>
        <Text fw="bold">単価</Text>
        <Text ml="sm">{selectedProject.price}</Text>

        <Stack mt="md">
          <Button color="blue" fullWidth onClick={handleEntry}>
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
