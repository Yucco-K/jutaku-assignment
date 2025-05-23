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
  const [errorMessage, setErrorMessage] = useState<string | null>('')
  const [attemptCount, setAttemptCount] = useState(0)
  const [isCoolDown, setIsCoolDown] = useState(false)
  const [coolDownTime, setCoolDownTime] = useState(300) // 5分 = 300秒

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })

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

  const onSignInSubmit = async (data: SignInFormData) => {
    try {
      setErrorMessage(null)
      const result = await signin(data)
      if (result.success) {
        notifications.show({
          title: '成功',
          message: 'ログインしました。',
          color: 'green'
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
      notifications.show({
        title: 'ログインエラー',
        message: errorMsg,
        color: 'red'
      })

      // 試行回数をカウントアップ
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      // 10回失敗したらクールダウン開始
      if (newAttemptCount >= 5) {
        setIsCoolDown(true)
        setCoolDownTime(300)
        setErrorMessage(
          'パスワードの入力に10回失敗しました。5分間待ってから再度お試しください。'
        )
      }
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
              disabled={isSubmitting || isCoolDown}
            />
            <PasswordInput
              label={<span className="form-label">パスワード</span>}
              required
              placeholder="password"
              {...register('password')}
              error={errors.password?.message}
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
