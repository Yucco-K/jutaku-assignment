'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signin } from '@/serverActions/supabaseAuth'
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })

  const onSignInSubmit = async (data: SignInFormData) => {
    setErrorMessage(null)
    try {
      await signin(data)
      router.push('/projects')
    } catch (error) {
      console.error('ログインエラー:', error)
      setErrorMessage(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      )
    }
  }

  return (
    <Container size="100%" my={40} className="form-container">
      <Title
        order={2}
        className="title"
        style={{ textAlign: 'center', color: '#5a5a5a', marginBottom: '2rem' }}
      >
        ログイン
      </Title>
      <Card
        withBorder
        shadow="sm"
        radius="md"
        padding="xl"
        className="card"
        style={{ maxWidth: '500px', margin: '0 auto' }}
      >
        {errorMessage && (
          <Text
            className="form-error"
            style={{ textAlign: 'center', color: 'red', marginBottom: '12px' }}
          >
            {errorMessage}
          </Text>
        )}

        <Divider my="lg" />
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
    </Container>
  )
}
