'use client'
import React, { useState } from 'react'
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
  Text,
  Group,
  Loader,
  Modal
} from '@mantine/core'
import { clientApi } from '~/lib/trpc/client-api'
import BackButton from '@/app/_components/BackButton'
import { useAdminAccessGuard } from '@/hooks/useAdminAccessGuard'

// バリデーションスキーマ
const schema = z.object({
  title: z.string().min(1, '案件名は必須です'),
  description: z.string().min(1, '概要は必須です'),
  skillNames: z
    .array(z.string())
    .min(1, '必要なスキルは1つ以上選択してください'),
  deadline: z.string().min(1, '募集締切日は必須です'),
  price: z.string().min(1, '単価は必須です')
})

export default function EditProject() {
  const router = useRouter()
  const params = useParams()
  const [modalOpened, setModalOpened] = useState(false)
  const { user, isLoading: isUserLoading } = useAdminAccessGuard()

  // プロジェクトとスキル一覧を取得
  const { data: project, isLoading: isProjectLoading } =
    clientApi.project.find.useQuery<{
      id: string
      title: string
      description: string | null
      price: number | null
      deadline: string | null
      created_at: string
      creator_id: string
      skills: Array<{ skill: { id: string; name: string } }>
    }>(params?.projectId as string)

  const { data: skills = [] } = clientApi.skill.list.useQuery()

  // プロジェクト更新のミューテーション
  const updateMutation = clientApi.project.update.useMutation()
  const updateSkillsMutation = clientApi.project.updateSkills.useMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  const selectedSkills = watch('skillNames') || []

  // プロジェクトデータをフォームに設定
  React.useEffect(() => {
    if (project) {
      setValue('title', project.title)
      setValue('description', project.description || '')
      setValue(
        'skillNames',
        project.skills.map((s) => s.skill.name) // ✅ 修正: skillIds ではなく skillNames をセット
      )
      // 日付を YYYY-MM-DD 形式に変換
      const formattedDate = project.deadline
        ? new Date(project.deadline).toISOString().split('T')[0]
        : ''
      setValue('deadline', formattedDate)
      setValue('price', project.price?.toString() || '')
    }
  }, [project, setValue])

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (typeof params?.projectId === 'string') {
      try {
        await updateMutation.mutateAsync({
          id: params.projectId,
          title: data.title,
          description: data.description,
          deadline: data.deadline,
          price: Number.parseInt(data.price, 10),
          skillNames: data.skillNames
        })

        // スキルの更新
        await updateSkillsMutation.mutateAsync({
          projectId: params.projectId,
          skillNames: data.skillNames
        })

        setModalOpened(true)
      } catch (error) {
        console.error('プロジェクト更新エラー:', error)
      }
    }
  }

  if (isProjectLoading || isUserLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 60px)',
          width: '100%'
        }}
      >
        <Loader size="xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Text>プロジェクトが見つかりません</Text>
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

      <BackButton />

      <Card
        shadow="md"
        padding="xl"
        style={{ maxWidth: '700px', margin: 'auto', marginBottom: '48px' }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="xl">
            <TextInput
              label={
                <span
                  className="form-label"
                  style={{ marginBottom: '10px', display: 'inline-block' }}
                >
                  案件名
                </span>
              }
              {...register('title')}
              error={errors.title?.message}
              size="md"
            />
            <Textarea
              label={
                <span
                  className="form-label"
                  style={{ marginBottom: '10px', display: 'inline-block' }}
                >
                  概要
                </span>
              }
              {...register('description')}
              error={errors.description?.message}
              size="md"
              minRows={4}
            />

            <MultiSelect
              label={
                <span
                  className="form-label"
                  style={{ marginBottom: '10px', display: 'inline-block' }}
                >
                  必要なスキル
                </span>
              }
              data={skills.map((skill) => ({
                value: skill.name,
                label: skill.name
              }))}
              value={selectedSkills}
              onChange={(value) => setValue('skillNames', value)}
              error={errors.skillNames?.message}
              searchable
              size="md"
              styles={{
                dropdown: {
                  zIndex: 9999
                }
              }}
            />

            <TextInput
              label={
                <span
                  className="form-label"
                  style={{ marginBottom: '10px', display: 'inline-block' }}
                >
                  募集締切日
                </span>
              }
              type="date"
              min={
                new Date(new Date().setDate(new Date().getDate() + 1))
                  .toISOString()
                  .split('T')[0]
              }
              {...register('deadline')}
              error={errors.deadline?.message}
              size="md"
            />
            <TextInput
              label={
                <span
                  className="form-label"
                  style={{ marginBottom: '10px', display: 'inline-block' }}
                >
                  単価
                </span>
              }
              type="text"
              {...register('price')}
              error={errors.price?.message}
              size="md"
            />

            <Button
              type="submit"
              color="blue"
              fullWidth
              disabled={isSubmitting || updateMutation.isLoading}
              className="button-group"
            >
              {updateMutation.isLoading ? (
                <Loader size="sm" color="white" />
              ) : (
                '更新する'
              )}
            </Button>
          </Stack>
        </form>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        centered
        className="modal-content"
        styles={{
          overlay: {
            zIndex: 1001
          },
          inner: {
            zIndex: 1002
          },
          content: {
            zIndex: 1003
          }
        }}
      >
        <Text
          style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '40px' }}
        >
          案件を更新しました！
        </Text>
        <Group justify="center" mt="xl" className="modal-footer">
          <Button color="blue" onClick={() => router.push('/admin/projects')}>
            OK
          </Button>
        </Group>
      </Modal>
    </>
  )
}
