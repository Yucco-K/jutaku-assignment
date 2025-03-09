'use client'
import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Title, Text, Group } from '@mantine/core'
import { useRouter } from 'next/navigation'
import useProjectStore from '@/store/projectStore' // ✅ Zustand のストアをインポート

export const AdminProjectList = () => {
  const router = useRouter()
  const { projects, loadProjects, deleteProject } = useProjectStore()
  const [opened, setOpened] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{
    id: string
    date: string
    name: string
    description: string
    skills: string[]
  } | null>(null)

  // ✅ 初回レンダリング時にローカルストレージのデータをロード
  useEffect(() => {
    loadProjects()
  }, [])

  const openModal = (project: {
    id: string
    date: string
    name: string
    description: string
    skills: string[]
  }) => {
    setSelectedProject(project)
    setOpened(true)
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
                    {project.date}
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
                    {project.name}
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
                    {project.description}
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
                    {project.skills.join(', ')}
                  </Table.Td>
                  <Table.Td
                    style={{
                      width: '300px',
                      border: '1px solid #e0e0e0',
                      padding: '12px'
                    }}
                  >
                    <Group gap="sm" justify="center" className="button-group">
                      <Button
                        color="blue"
                        size="xs"
                        style={{
                          flex: 1,
                          minWidth: '30px',
                          fontSize: '0.8rem'
                        }}
                        onClick={() =>
                          router.push(`/admin/projects/${project.id}`)
                        }
                      >
                        詳細
                      </Button>
                      <Button
                        color="blue"
                        size="xs"
                        style={{
                          flex: 1,
                          minWidth: '30px',
                          fontSize: '0.8rem'
                        }}
                        onClick={() =>
                          router.push(`/admin/projects/${project.id}/edit`)
                        }
                      >
                        編集
                      </Button>
                      <Button
                        color="red"
                        size="xs"
                        style={{
                          flex: 1,
                          minWidth: '30px',
                          fontSize: '0.8rem'
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
        <Text>この案件を削除します。よろしいですか？</Text>
        <Group justify="flex-end" gap="sm" mt="md" className="modal-footer">
          <Button
            color="red"
            mt="md"
            onClick={() => {
              if (selectedProject) {
                deleteProject(selectedProject.id)
                setOpened(false)
              }
            }}
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
