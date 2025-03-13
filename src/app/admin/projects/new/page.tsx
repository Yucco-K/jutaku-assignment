'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  Loader,
  Text
} from '@mantine/core'
import { clientApi } from '~/lib/trpc/client-api'
import type { TRPCClientErrorLike } from '@trpc/client'
import type { DefaultErrorShape } from '@trpc/server'
import BackButton from '@/app/_components/BackButton'

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
  const [errorMessage, setErrorMessage] = useState<string>('')

  // tRPC でプロジェクト一覧とスキル一覧を取得
  const { data: projects, isLoading: isProjectLoading } =
    clientApi.project.list.useQuery()
  const { data: skills = [], isLoading: isSkillLoading } =
    clientApi.skill.list.useQuery()

  // スキルデータをMultiSelect用に整形
  const skillOptions = skills.map((skill) => ({
    value: skill.name,
    label: skill.name
  }))

  // tRPC でプロジェクト作成
  const mutation = clientApi.project.create.useMutation({
    onSuccess: () => {
      setModalOpened(true)
      setErrorMessage('')
    },
    onError: (error: TRPCClientErrorLike<DefaultErrorShape>) => {
      console.error('プロジェクトの登録に失敗しました:', error)
      if (error.message.includes('スキル')) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(
          'プロジェクトの登録に失敗しました。時間をおいて再度お試しください。'
        )
      }
    }
  })

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

  const onSubmit = async (data: {
    name: string
    description: string
    skills: string[]
    deadline: string
    price: string
  }) => {
    mutation.mutate({
      title: data.name,
      description: data.description,
      skillNames: data.skills,
      deadline: data.deadline,
      price: Number(data.price)
    })
  }

  return (
    <>
      <Title
        order={2}
        style={{
          textAlign: 'center',
          color: '#5a5a5a',
          marginTop: '32px',
          marginBottom: '32px'
        }}
      >
        新規案件作成
      </Title>

      {errorMessage && (
        <Text
          style={{
            textAlign: 'center',
            color: 'red'
          }}
          mb="md"
        >
          {errorMessage}
        </Text>
      )}

      <BackButton />

      <Card
        shadow="sm"
        padding="lg"
        withBorder
        style={{ maxWidth: '700px', margin: 'auto' }}
      >
        {isProjectLoading ? (
          <Loader color="blue" />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl">
              <TextInput
                label={
                  <span
                    style={{ marginBottom: '10px', display: 'inline-block' }}
                  >
                    案件名
                  </span>
                }
                required
                {...register('name')}
                error={errors.name?.message}
                size="md"
              />
              <Textarea
                label={
                  <span
                    style={{ marginBottom: '10px', display: 'inline-block' }}
                  >
                    概要
                  </span>
                }
                required
                {...register('description')}
                error={errors.description?.message}
                size="md"
                minRows={4}
              />

              <Controller
                control={control}
                name="skills"
                render={({ field }) => (
                  <MultiSelect
                    label={
                      <span
                        style={{
                          marginBottom: '10px',
                          display: 'inline-block'
                        }}
                      >
                        必要なスキル
                      </span>
                    }
                    required
                    data={skillOptions}
                    error={errors.skills?.message}
                    {...field}
                    searchable
                    nothingFoundMessage="スキルが見つかりません"
                    placeholder="スキルを選択してください"
                    size="md"
                  />
                )}
              />

              <TextInput
                label={
                  <span
                    style={{ marginBottom: '10px', display: 'inline-block' }}
                  >
                    募集締切日
                  </span>
                }
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                {...register('deadline')}
                error={errors.deadline?.message}
                size="md"
              />
              <TextInput
                label={
                  <span
                    style={{ marginBottom: '10px', display: 'inline-block' }}
                  >
                    単価
                  </span>
                }
                type="number"
                required
                {...register('price')}
                error={errors.price?.message}
                size="md"
              />

              <Button
                type="submit"
                color="blue"
                fullWidth
                disabled={isSubmitting || mutation.isLoading}
                mt="xl"
              >
                {mutation.isLoading ? (
                  <Loader size="sm" color="white" />
                ) : (
                  '登録'
                )}
              </Button>
            </Stack>
          </form>
        )}
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        centered
        transitionProps={{ duration: 0 }}
        styles={{
          overlay: {
            zIndex: 1001
          },
          inner: {
            zIndex: 1002
          },
          content: {
            zIndex: 1002
          }
        }}
      >
        <Title order={5} style={{ textAlign: 'center' }}>
          案件が作成されました！
        </Title>
        <Group justify="center" mt="xl">
          <Button color="blue" onClick={() => router.push('/admin/projects')}>
            OK
          </Button>
        </Group>
      </Modal>
    </>
  )
}
