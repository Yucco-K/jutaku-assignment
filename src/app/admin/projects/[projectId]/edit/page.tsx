'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useParams } from 'next/navigation'
import {
  Card,
  Button,
  Title,
  TextInput,
  Textarea,
  Stack,
  MultiSelect,
  Modal,
  Text,
  Group,
  Loader
} from '@mantine/core'
import useProjectStore from '@/store/projectStore'

// ✅ バリデーションスキーマ
const schema = z.object({
  name: z.string().min(1, '案件名は必須です'),
  description: z.string().min(1, '概要は必須です'),
  skills: z.array(z.string()).min(1, '必要なスキルは1つ以上選択してください'),
  deadline: z.string().min(1, '募集締切日は必須です'),
  price: z.string().min(1, '単価は必須です')
})

export default function EditProject() {
  const router = useRouter()
  const params = useParams()
  const projectId =
    typeof params?.projectId === 'string' ? params.projectId : ''

  const { selectedProject, loadProjectById, updateProject } = useProjectStore()
  const [modalOpened, setModalOpened] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  const skills = watch('skills')

  // ✅ 初回ロード時にプロジェクトデータを取得
  useEffect(() => {
    if (projectId) {
      loadProjectById(projectId)
    }
  }, [projectId, loadProjectById])

  // ✅ `selectedProject` の変更を検知してフォームに反映
  useEffect(() => {
    if (selectedProject) {
      console.log('Selected project changed:', selectedProject)
      const formData = {
        name: selectedProject.name,
        description: selectedProject.description,
        skills: selectedProject.skills,
        deadline: selectedProject.deadline,
        price: selectedProject.price
      }
      reset(formData)
    }
  }, [selectedProject, reset])

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (projectId) {
      try {
        updateProject(projectId, data)
        setModalOpened(true)
        router.push('/admin/projects')
      } catch (error) {
        console.error('Error updating project:', error)
      }
    }
  }

  // ✅ `selectedProject` がまだロードされていない場合の処理
  if (!selectedProject) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Loader size="xl" color="blue" />
        <Text mt="md">データを読み込んでいます...</Text>
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
          marginBottom: '32px'
        }}
      >
        案件編集
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
            marginRight: '160px'
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
        className="form-container"
        style={{ maxWidth: '600px', margin: 'auto' }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label={<span className="form-label">案件名</span>}
              {...register('name')}
              error={errors.name?.message}
            />
            <Textarea
              label={<span className="form-label">概要</span>}
              {...register('description')}
              error={errors.description?.message}
            />

            <MultiSelect
              label={<span className="form-label">必要なスキル</span>}
              data={['Next.js', 'React', 'TypeScript', 'Supabase', 'Node.js']}
              value={skills}
              onChange={(value) => setValue('skills', value)}
              error={errors.skills?.message}
              searchable
            />

            <TextInput
              label={<span className="form-label">募集締切日</span>}
              type="date"
              {...register('deadline')}
              error={errors.deadline?.message}
            />
            <TextInput
              label={<span className="form-label">単価</span>}
              type="text"
              {...register('price')}
              error={errors.price?.message}
            />

            <Button
              type="submit"
              color="blue"
              fullWidth
              disabled={isSubmitting}
              className="button-group"
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : '更新する'}
            </Button>
          </Stack>
        </form>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        centered
        className="modal-content"
      >
        <Text style={{ textAlign: 'center' }}>案件を更新しました！</Text>
        <Group justify="flex-end" mt="md" className="modal-footer">
          <Button color="blue" onClick={() => router.push('/admin/projects')}>
            OK
          </Button>
        </Group>
      </Modal>
    </>
  )
}
