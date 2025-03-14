'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signin } from '@/serverActions/supabaseAuth'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import {
  Card,
  Button,
  TextInput,
  PasswordInput,
  Title,
  Stack,
  Container,
  Group,
  Divider,
  Text,
  Loader,
  Notification
} from '@mantine/core'

const signInSchema = z.object({
  email: z.string().email({ message: '無効なメールアドレスです' }),
  password: z
    .string()
    .min(8, { message: 'パスワードは英数字8文字以上' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, {
      message: 'パスワードは英字と数字をそれぞれ1文字以上含める必要があります'
    })
})
type SignInFormData = z.infer<typeof signInSchema>

export function SigninForm() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })

  const onSignInSubmit = async (data: SignInFormData) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const result = await signin(data)
      if (result.success) {
        setSuccessMessage('ログインしました。')
        notifications.show({
          title: 'ログイン成功',
          message: 'ログインしました。',
          color: 'green',
          autoClose: 3000
        })
        setTimeout(() => {
          router.push('/projects')
        }, 1000)
      } else {
        throw new Error(result.error || 'ログインに失敗しました。')
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      setErrorMessage(errorMsg)
      notifications.show({
        title: 'ログインエラー',
        message: errorMsg,
        color: 'red',
        autoClose: 3000
      })
    }
  }

  return (
    <Container
      size={500}
      my={40}
      className="form-container"
      style={{ padding: '0 20px' }}
    >
      <Title
        order={3}
        className="title"
        style={{ textAlign: 'center', color: '#5a5a5a', marginBottom: '40px' }}
      >
        ログイン
      </Title>
      <Card
        shadow="sm"
        radius="md"
        padding="xl"
        className="card"
        style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
      >
        <form onSubmit={handleSubmit(onSignInSubmit)}>
          <Stack>
            <TextInput
              label={<span className="form-label">メールアドレス</span>}
              required
              placeholder="email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isSubmitting}
            />
            <PasswordInput
              label={<span className="form-label">パスワード</span>}
              required
              placeholder="password"
              {...register('password')}
              error={errors.password?.message}
              disabled={isSubmitting}
            />
            <Group className="button-group flex justify-center" my={12}>
              <Button type="submit" loading={isSubmitting} fullWidth>
                {isSubmitting ? <Loader size="sm" color="white" /> : 'ログイン'}
              </Button>
            </Group>
          </Stack>
        </form>
        <Text className="text-center" mt="md">
          アカウントをお持ちでないですか？{' '}
          <Link href="/signup" passHref>
            <Button variant="subtle" className="nav-link">
              新規登録
            </Button>
          </Link>
        </Text>
      </Card>
      {successMessage && (
        <Notification
          color="green"
          onClose={() => setSuccessMessage(null)}
          mt="md"
          style={{ maxWidth: '500px', margin: '20px auto 0' }}
        >
          {successMessage}
        </Notification>
      )}
      {errorMessage && (
        <Notification
          color="red"
          onClose={() => setErrorMessage(null)}
          mt="md"
          style={{ maxWidth: '500px', margin: '20px auto 0' }}
        >
          {errorMessage}
        </Notification>
      )}
    </Container>
  )
}
