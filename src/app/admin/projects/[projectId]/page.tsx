'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { RouteLiteral } from 'nextjs-routes'
import {
  Card,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Modal,
  Table
} from '@mantine/core'

// 案件データの型定義
type Project = {
  id: number
  name: string
  description: string
  skills: string
  deadline: string
  price: string
}

// エントリー一覧データ
const entryList = [
  { id: 1, name: '吉田 一郎' },
  { id: 2, name: '田中 次郎' },
  { id: 3, name: '加藤 三郎' },
  { id: 4, name: '斉藤 四郎' }
]

export default function AdminProjectDetail() {
  const router = useRouter()
  const params = useParams()
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [entryModalOpened, setEntryModalOpened] = useState(false)
  const [adminProject, setAdminProject] = useState<Project>({
    id: 0,
    name: '',
    description: '',
    skills: '',
    deadline: '',
    price: ''
  })

  // 初回レンダリング時にlocalStorageからデータを読み込む
  useEffect(() => {
    const loadProject = () => {
      try {
        const storedProjects = localStorage.getItem('projects')
        if (storedProjects) {
          const projects: Project[] = JSON.parse(storedProjects)
          const projectId = params?.projectId ? String(params.projectId) : ''
          console.log('Current projectId:', projectId)
          console.log('Available projects:', projects)

          const project = projects.find((p) => String(p.id) === projectId)
          console.log('Found project:', project)

          if (project) {
            setAdminProject(project)
          } else {
            console.error('Project not found')
            setAdminProject({
              id: 0,
              name: '案件が見つかりません',
              description: '',
              skills: '',
              deadline: '',
              price: ''
            })
          }
        } else {
          console.error('No projects found in localStorage')
          setAdminProject({
            id: 0,
            name: '案件が見つかりません',
            description: '',
            skills: '',
            deadline: '',
            price: ''
          })
        }
      } catch (error) {
        console.error('Error loading project:', error)
        setAdminProject({
          id: 0,
          name: 'エラーが発生しました',
          description: '',
          skills: '',
          deadline: '',
          price: ''
        })
      }
    }

    if (typeof window !== 'undefined' && params?.projectId) {
      loadProject()
    }
  }, [params?.projectId])

  // 編集ボタンのクリックハンドラ
  const handleEdit = () => {
    if (params?.projectId) {
      router.push(`/admin/projects/${params.projectId}/edit` as RouteLiteral)
    }
  }

  // 削除ボタンのクリックハンドラ
  const handleDelete = () => {
    if (typeof window !== 'undefined' && params?.projectId) {
      try {
        const storedProjects = localStorage.getItem('projects')
        if (storedProjects) {
          const projects: Project[] = JSON.parse(storedProjects)
          const projectId = String(params.projectId)
          const updatedProjects = projects.filter(
            (p) => String(p.id) !== projectId
          )
          localStorage.setItem('projects', JSON.stringify(updatedProjects))
        }
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
    setDeleteModalOpened(false)
    router.push('/admin/projects')
  }

  // 戻るボタンのクリックハンドラ
  const handleBack = () => {
    router.push('/admin/projects')
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
          onClick={handleBack}
        >
          戻る
        </Button>
      </div>

      <Table style={{ maxWidth: '1000px', margin: 'auto' }}>
        <Table.Tbody>
          {[
            ['案件名', adminProject.name],
            ['概要', adminProject.description],
            ['必要スキル', adminProject.skills],
            ['募集締切日', adminProject.deadline],
            ['単価', `${adminProject.price}円`]
          ].map(([label, value], index) => (
            <Table.Tr key={label}>
              <Table.Th
                style={{
                  backgroundColor: '#E3F2FD',
                  textAlign: 'center',
                  width: '30%'
                }}
              >
                {label}
              </Table.Th>
              <Table.Td style={{ textAlign: 'center' }}>{value}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <div style={{ width: '400px', margin: '40px auto 0' }}>
        <Stack align="center">
          <Button
            color="blue"
            size="sm"
            onClick={handleEdit}
            style={{
              width: '300px',
              margin: '0 20px'
            }}
          >
            編集する
          </Button>
          <Button
            color="blue"
            size="sm"
            onClick={() => setEntryModalOpened(true)}
            style={{
              width: '300px',
              margin: '0 20px'
            }}
          >
            この案件のエントリー一覧を見る
          </Button>
          <Button
            color="red"
            size="sm"
            onClick={() => setDeleteModalOpened(true)}
            style={{
              width: '300px',
              margin: '0 20px'
            }}
          >
            この案件を削除する
          </Button>
        </Stack>
      </div>

      <Modal
        opened={entryModalOpened}
        onClose={() => setEntryModalOpened(false)}
        title="エントリー 一覧"
        centered
      >
        <Table>
          <Table.Tbody>
            {entryList.map((entry) => (
              <Table.Tr key={entry.id}>
                <Table.Td style={{ textAlign: 'center' }}>
                  {entry.name}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Modal>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        centered
      >
        <Text style={{ textAlign: 'center' }}>この案件を削除しますか？</Text>
        <Group justify="flex-end" gap="sm" mt="xl" mb="md">
          <Button color="red" onClick={handleDelete}>
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
