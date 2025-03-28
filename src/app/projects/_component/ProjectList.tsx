'use client'
import React from 'react'
import { Table, Button, Title, Loader, Text } from '@mantine/core'
import { useRouter } from 'next/navigation'
import type { RouteLiteral } from 'nextjs-routes'
import { clientApi } from '~/lib/trpc/client-api'

export const ProjectList = () => {
  const router = useRouter()
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

  // 案件詳細ページへの遷移処理
  const handleProjectDetail = (projectId: string) => {
    router.push(`/projects/${projectId}` as RouteLiteral)
  }

  return (
    <>
      <Title
        order={2}
        className="title"
        style={{
          textAlign: 'center',
          color: '#5a5a5a',
          marginBottom: '48px',
          letterSpacing: '0.5px'
        }}
      >
        案件一覧
      </Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '32px',
          padding: '0 20px',
          maxWidth: '1200px',
          margin: '0 auto 32px'
        }}
      >
        <Button
          color="blue"
          size="sm"
          className="nav-link"
          style={{
            width: 'auto',
            minWidth: '200px',
            marginRight: '20px',
            letterSpacing: '0.5px'
          }}
          onClick={() => router.push('/entry-list')}
        >
          エントリー 一覧
        </Button>
      </div>
      <div className="table-container" style={{ marginBottom: '48px' }}>
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
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                案件作成日
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '250px',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                案件名
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '300px',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                概要
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '250px',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                必要なスキル
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
                操作
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td
                  colSpan={5}
                  style={{
                    height: 'calc(100vh - 250px)',
                    border: 'none'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      height: '100%',
                      gap: '16px'
                    }}
                  >
                    <Loader size="xl" />
                  </div>
                </Table.Td>
              </Table.Tr>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <Table.Tr key={project.id} style={{ textAlign: 'center' }}>
                  <Table.Td
                    style={{
                      width: '150px',
                      border: '1px solid #e0e0e0',
                      padding: '16px',
                      lineHeight: '1.6'
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
                      padding: '16px',
                      lineHeight: '1.6'
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
                      padding: '16px',
                      lineHeight: '1.6'
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
                      padding: '16px',
                      lineHeight: '1.6'
                    }}
                  >
                    {project.skills
                      ?.map((skill) => skill.skill.name)
                      .join(', ')}
                  </Table.Td>
                  <Table.Td
                    style={{
                      width: '120px',
                      border: '1px solid #e0e0e0',
                      padding: '16px'
                    }}
                  >
                    <Button
                      color="blue"
                      size="xs"
                      className="button-group"
                      style={{
                        flex: 1,
                        minWidth: '30px',
                        fontSize: '0.8rem',
                        letterSpacing: '0.5px'
                      }}
                      onClick={() => handleProjectDetail(project.id)}
                    >
                      詳細
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                    fontSize: '1.1rem'
                  }}
                >
                  データがありません
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>
    </>
  )
}
