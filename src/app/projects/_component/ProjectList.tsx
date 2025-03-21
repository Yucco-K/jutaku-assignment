'use client'
import React, { useEffect, useState } from 'react'
import { Table, Button, Title } from '@mantine/core'
import { useRouter } from 'next/navigation'
import type { RouteLiteral } from 'nextjs-routes'

// 日付フォーマット用のヘルパー関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

export const ProjectList = () => {
  const router = useRouter()
  const [projects, setProjects] = useState<
    {
      id: number
      date: string
      name: string
      description: string
      skills: string
    }[]
  >([])

  // 初回レンダリング時に localStorage からデータを読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProjects = localStorage.getItem('projects')
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects))
      }
    }
  }, [])

  // 案件詳細ページへの遷移処理
  const handleProjectDetail = (projectId: number) => {
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
          marginBottom: '44px'
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
          onClick={() => router.push('/entry-list')}
        >
          エントリー 一覧
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
                必要なスキル
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  width: '120px',
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
                    {formatDate(project.date)}
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
                    {Array.isArray(project.skills)
                      ? project.skills.join(', ')
                      : project.skills}
                  </Table.Td>
                  <Table.Td
                    style={{
                      width: '120px',
                      border: '1px solid #e0e0e0',
                      padding: '12px'
                    }}
                  >
                    <Button
                      color="blue"
                      size="xs"
                      className="button-group"
                      style={{ flex: 1, minWidth: '30px', fontSize: '0.8rem' }}
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
                  style={{ textAlign: 'center', padding: '20px' }}
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
