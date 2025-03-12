'use client'
import React, { useState } from 'react'
import { Table, Button, Modal, Title, Text, Group, Loader } from '@mantine/core'
import { useRouter } from 'next/navigation'
import type { RouteLiteral } from 'nextjs-routes'
import { clientApi } from '~/lib/trpc/client-api'
import { useMediaQuery } from '@mantine/hooks'
import BackButton from '@/app/_components/BackButton'

export const AdminProjectList = () => {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [opened, setOpened] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{
    id: string
    title: string
    description: string | null
    created_at: string
    creator_id: string
    price: number | null
    deadline: string | null
  } | null>(null)

  // tRPCを使用してプロジェクト一覧を取得
  const { data: projects = [], isLoading } =
    clientApi.project.list.useQuery<
      {
        id: string
        created_at: string
        title: string
        description: string | null
        price: number | null
        deadline: string | null
        creator_id: string
        skills: Array<{
          skill: {
            id: string
            name: string
          }
        }>
      }[]
    >()

  const utils = clientApi.useUtils()

  // プロジェクトIDに紐づくスキルを取得する関数
  const getProjectSkills = (project: {
    skills?: Array<{
      skill: {
        name: string
      }
    }>
  }) => {
    return project.skills?.map((s) => s.skill.name).join(', ') || '-'
  }

  // プロジェクト削除のミューテーション
  const deleteMutation = clientApi.project.delete.useMutation({
    onSuccess: () => {
      setOpened(false)
      // キャッシュを更新するためにクエリを無効化
      utils.project.list.invalidate()
    }
  })

  const openModal = (project: {
    id: string
    title: string
    description: string | null
    created_at: string
    creator_id: string
    price: number | null
    deadline: string | null
  }) => {
    setSelectedProject(project)
    setOpened(true)
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

  return (
    <>
      <Title
        order={2}
        className="title"
        style={{
          textAlign: 'center',
          color: '#5a5a5a',
          marginTop: '32px',
          marginBottom: '36px'
        }}
      >
        案件一覧
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
          onClick={() => router.push('/admin/projects/new')}
        >
          新規案件作成
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
                  width: '150px',
                  border: '1px solid #e0e0e0',
                  padding: '12px'
                }}
              >
                案件作成日
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '250px',
                  border: '1px solid #e0e0e0',
                  padding: '12px'
                }}
              >
                案件名
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '300px',
                  border: '1px solid #e0e0e0',
                  padding: '12px'
                }}
              >
                概要
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '250px',
                  border: '1px solid #e0e0e0',
                  padding: '12px'
                }}
              >
                必要スキル
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '300px',
                  border: '1px solid #e0e0e0',
                  padding: '12px'
                }}
              >
                操作
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <Table.Tr key={project.id} style={{ textAlign: 'center' }}>
                  <Table.Td
                    style={{
                      width: '150px',
                      border: '1px solid #e0e0e0',
                      padding: '12px'
                    }}
                  >
                    {new Date(project.created_at).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td
                    style={{
                      width: '250px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      border: '1px solid #e0e0e0',
                      padding: '12px'
                    }}
                  >
                    {project.title}
                  </Table.Td>
                  <Table.Td
                    style={{
                      width: '300px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      border: '1px solid #e0e0e0',
                      padding: '12px'
                    }}
                  >
                    {project.description || ''}
                  </Table.Td>
                  <Table.Td
                    style={{
                      width: '250px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      border: '1px solid #e0e0e0',
                      padding: '12px'
                    }}
                  >
                    {getProjectSkills(project)}
                  </Table.Td>
                  <Table.Td
                    style={{
                      width: '300px',
                      border: '1px solid #e0e0e0',
                      padding: '12px'
                    }}
                  >
                    <Group
                      gap="xs"
                      justify="center"
                      wrap="nowrap"
                      style={{
                        minWidth: 'max-content',
                        maxWidth: '225px',
                        margin: '0 auto'
                      }}
                    >
                      <Button
                        color="blue"
                        size="sm"
                        style={{
                          flex: '1 0 auto',
                          minWidth: '45px',
                          maxWidth: '67.5px',
                          padding: '4px 12px',
                          fontSize: '0.85rem'
                        }}
                        onClick={() =>
                          router.push(
                            `/admin/projects/${project.id}` as RouteLiteral
                          )
                        }
                      >
                        詳細
                      </Button>
                      <Button
                        color="blue"
                        size="sm"
                        style={{
                          flex: '1 0 auto',
                          minWidth: '45px',
                          maxWidth: '67.5px',
                          padding: '4px 12px',
                          fontSize: '0.85rem'
                        }}
                        onClick={() =>
                          router.push(
                            `/admin/projects/${project.id}/edit` as RouteLiteral
                          )
                        }
                      >
                        編集
                      </Button>
                      <Button
                        color="red"
                        size="sm"
                        style={{
                          flex: '1 0 auto',
                          minWidth: '45px',
                          maxWidth: '67.5px',
                          padding: '4px 12px',
                          fontSize: '0.85rem',
                          backgroundColor: '#FF6B6B',
                          '&:hover': {
                            backgroundColor: '#FF5252'
                          }
                        }}
                        onClick={() => openModal(project)}
                      >
                        削除
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={5}
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  データがありません
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        className="modal-content"
      >
        <Text
          style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '40px' }}
        >
          この案件を削除します。よろしいですか？
        </Text>
        <Group justify="center" gap="sm" mt="xl" className="modal-footer">
          <Button
            color="red"
            mt="md"
            style={{
              backgroundColor: '#FF6B6B',
              '&:hover': {
                backgroundColor: '#FF5252'
              }
            }}
            onClick={() => {
              if (selectedProject) {
                deleteMutation.mutate(selectedProject.id)
              }
            }}
            loading={deleteMutation.isLoading}
          >
            はい
          </Button>

          <Button variant="default" mt="md" onClick={() => setOpened(false)}>
            いいえ
          </Button>
        </Group>
      </Modal>
    </>
  )
}
