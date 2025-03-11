'use client'
import React from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signup } from '@/serverActions/supabaseAuth'
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
  Loader
} from '@mantine/core'

const signupSchema = z
  .object({
    name: z.string().min(1, { message: '名前は必須です' }),
    email: z.string().email({ message: '無効なメールアドレスです' }),
    password: z
      .string()
      .min(8, { message: 'パスワードは8文字以上にしてください' })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, {
        message: 'パスワードは英字と数字をそれぞれ1文字以上含める必要があります'
      }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword']
  })

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      const result = await signup(data)
      console.log('signup result:', result)
      alert('新規登録が完了しました')
      router.push('/projects')
    } catch (error) {
      console.error('登録エラー:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : '登録に失敗しました。もう一度お試しください。'
      alert(errorMessage)
    }
  }

  return (
    <Container size={500} my={80} className="form-container">
      <Card withBorder shadow="sm" radius="md" padding="xl" className="card">
        <Title
          order={3}
          className="title"
          style={{ textAlign: 'center', color: '#5a5a5a' }}
        >
          新規登録
        </Title>
        <Divider my="lg" />

        <form onSubmit={handleSubmit(onSignupSubmit)}>
          <Stack>
            <TextInput
              label={<span className="form-label">お名前</span>}
              required
              placeholder="お名前"
              {...register('name')}
              error={errors.name?.message}
              disabled={isSubmitting}
            />
            <TextInput
              label={<span className="form-label">メールアドレス</span>}
              required
              placeholder="email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isSubmitting}
            />
            <PasswordInput
              label={
                <span className="form-label">
                  パスワード（パスワードは英数字8文字以上）
                </span>
              }
              required
              placeholder="password"
              {...register('password')}
              error={errors.password?.message}
              disabled={isSubmitting}
            />
            <PasswordInput
              label={<span className="form-label">パスワード（確認）</span>}
              required
              placeholder="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting}
            />
            <Group className="button-group flex justify-center" my={12}>
              <Button type="submit" loading={isSubmitting} fullWidth>
                {isSubmitting ? <Loader size="sm" color="white" /> : '登録'}
              </Button>
            </Group>
          </Stack>
        </form>
        <Text className="text-center mt-4">
          既にアカウントをお持ちですか？{' '}
          <Link href="/" passHref>
            <Button variant="subtle" size="sm" className="nav-link">
              ログイン
            </Button>
          </Link>
        </Text>
      </Card>
    </Container>
  )
}
