'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signup } from '@/serverActions/supabaseAuth'
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
  Text,
  Loader,
  Notification
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

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isCoolDown, setIsCoolDown] = useState(false)
  const [coolDownTime, setCoolDownTime] = useState(300) // 5分 = 300秒

  // クールダウンのカウントダウン
  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (isCoolDown && coolDownTime > 0) {
      timer = setInterval(() => {
        setCoolDownTime((prev) => prev - 1)
      }, 1000)
    } else if (coolDownTime === 0) {
      setIsCoolDown(false)
      setAttemptCount(0)
    }
    return () => clearInterval(timer)
  }, [isCoolDown, coolDownTime])

  const onSignupSubmit = async (data: SignupFormData) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await signup(data)

      setSuccessMessage('アカウントが作成されました。')
      notifications.show({
        title: '登録成功',
        message: 'アカウントが作成されました。',
        color: 'green',
        autoClose: 3000
      })
      setTimeout(() => {
        router.push('/projects')
      }, 1000)
    } catch (error) {
      console.error('登録エラー:', error)

      const errorMsg =
        error instanceof Error
          ? error.message
          : `登録に失敗しました。もう一度お試しください。 ${error}`
      setErrorMessage(errorMsg)
      notifications.show({
        title: '登録エラー',
        message: errorMsg,
        color: 'red',
        autoClose: 3000
      })

      // 試行回数をカウントアップ
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      // 10回失敗したらクールダウン開始
      if (newAttemptCount >= 5) {
        setIsCoolDown(true)
        setCoolDownTime(300)
        setErrorMessage(
          '登録に10回失敗しました。5分間待ってから再度お試しください。'
        )
      }
    }
  }
  return (
    <Container
      size={500}
      my={80}
      className="form-container"
      style={{ padding: '0 20px' }}
    >
      <Title
        order={3}
        className="title"
        style={{ textAlign: 'center', color: '#5a5a5a', marginBottom: '40px' }}
      >
        新規登録
      </Title>
      <Card
        shadow="sm"
        radius="md"
        padding="xl"
        className="card"
        style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
      >
        <form onSubmit={handleSubmit(onSignupSubmit)}>
          <Stack>
            <TextInput
              label={<span className="form-label">お名前</span>}
              required
              placeholder="お名前"
              {...register('name')}
              error={errors.name?.message}
              disabled={isSubmitting || isCoolDown}
            />
            <TextInput
              label={<span className="form-label">メールアドレス</span>}
              required
              placeholder="email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isSubmitting || isCoolDown}
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
              disabled={isSubmitting || isCoolDown}
            />
            <PasswordInput
              label={<span className="form-label">パスワード（確認）</span>}
              required
              placeholder="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting || isCoolDown}
            />
            {isCoolDown && (
              <Text c="red" size="sm" ta="center">
                残り時間: {Math.floor(coolDownTime / 60)}分{coolDownTime % 60}秒
              </Text>
            )}
            <Group className="button-group flex justify-center" my={12}>
              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                disabled={isCoolDown}
              >
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
