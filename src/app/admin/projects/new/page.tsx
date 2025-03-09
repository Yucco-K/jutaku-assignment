'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useProjectStore from '@/store/projectStore'
import {
  TextInput,
  Textarea,
  Button,
  Title,
  Stack,
  Group,
  Modal,
  Card,
  MultiSelect,
  Loader
} from '@mantine/core'

// Zustandストア（データのローカル保存）
interface Project {
  name: string
  description: string
  skills: string[]
  deadline: string
  price: string
}

interface ProjectState {
  projects: Project[]
  addProject: (project: Project) => void
}

// フォームスキーマ定義
const projectSchema = z.object({
  name: z.string().min(1, '案件名は必須です'),
  description: z.string().min(1, '概要は必須です'),
  skills: z.array(z.string()).min(1, '必要なスキルを1つ以上選択してください'),
  deadline: z.string().min(1, '募集締切日は必須です'),
  price: z.string().min(1, '単価は必須です')
})

export default function NewProject() {
  const router = useRouter()
  const [modalOpened, setModalOpened] = useState(false)
  const { addProject, loadProjects, projects } = useProjectStore() // ✅ Zustand ストアを利用

  // ✅ 初回レンダリング時にローカルストレージのデータをロード
  useEffect(() => {
    loadProjects()
  }, [])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<{
    name: string
    description: string
    skills: string[]
    deadline: string
    price: string
  }>({
    resolver: zodResolver(projectSchema)
  })

  const onSubmit = (data: {
    name: string
    description: string
    skills: string[]
    deadline: string
    price: string
  }) => {
    const projectWithIdAndDate = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString()
    }
    addProject(projectWithIdAndDate)
    setModalOpened(true)
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
        新規案件作成
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
        className="form-container"
        style={{ maxWidth: '500px', margin: 'auto' }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label={<span className="form-label">案件名</span>}
              required
              {...register('name')}
              error={
                errors.name?.message ? String(errors.name.message) : undefined
              }
            />
            <Textarea
              label={<span className="form-label">概要</span>}
              required
              {...register('description')}
              error={
                errors.description?.message
                  ? String(errors.description.message)
                  : undefined
              }
            />

            <Controller
              control={control}
              name="skills"
              render={({ field }) => (
                <MultiSelect
                  label={<span className="form-label">必要なスキル</span>}
                  required
                  data={['Next.js', 'Supabase', 'Typescript', 'React']}
                  error={
                    errors.skills?.message
                      ? String(errors.skills.message)
                      : undefined
                  }
                  {...field}
                  searchable
                />
              )}
            />

            <TextInput
              label={<span className="form-label">募集締切日</span>}
              type="date"
              required
              {...register('deadline')}
              error={errors.deadline?.message?.toString()}
            />
            <TextInput
              label={<span className="form-label">単価</span>}
              type="number"
              required
              {...register('price')}
              error={errors.price?.message?.toString()}
            />

            <Button
              type="submit"
              color="blue"
              fullWidth
              disabled={isSubmitting}
              className="button-group"
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : '登録'}
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
        <Title order={5} style={{ textAlign: 'center' }}>
          案件が作成されました！
        </Title>
        <Group justify="center" mt="xl" className="modal-footer">
          <Button color="blue" onClick={() => router.push('/admin/projects')}>
            OK
          </Button>
        </Group>
      </Modal>
    </>
  )
}
