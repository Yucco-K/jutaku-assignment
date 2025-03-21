'use server'

import { AFTER_SIGNOUT_PATH } from '@/const/config'
import { redirect } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'
import { serverApi } from '~/lib/trpc/server-api'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type EmailAndPassword = {
  email: string
  password: string
}

export const signup = async ({
  email,
  password,
  name
}: EmailAndPassword & { name: string }): Promise<{
  success?: boolean
  message?: string
  error?: string
}> => {
  try {
    console.log('signup:', { email, password, name })

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error(
        'このメールアドレスは既に使用されています。別のメールアドレスを使用してください。'
      )
    }

    const authResponse = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (authResponse.error) {
      throw new Error(
        `サインアップ中にエラーが発生しました: ${authResponse.error.message}`
      )
    }

    const user = authResponse.data.user
    if (!user?.id) {
      throw new Error('ユーザーIDが取得できませんでした')
    }

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? '',
        name: name
      }
    })

    console.log('signup:', user.id)
    return { success: true, message: 'アカウントが作成されました。' }
  } catch (error) {
    console.error('signupエラー:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'サインアップ中に不明なエラーが発生しました'
    )
  }
}

export const signin = async ({
  email,
  password
}: EmailAndPassword): Promise<{
  success?: boolean
  message?: string
  error?: string
}> => {
  try {
    console.log('signin:', { email, password })

    const { data, error } = await createClient().auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('🚨 Sign-in error:', error.message)
      throw new Error(`ログイン中にエラーが発生しました: ${error.message}`)
    }
    if (!data) {
      throw new Error('ログインデータが取得できませんでした')
    }

    console.log('ログイン成功:', { data })
    return { success: true, message: 'ログインしました。' }
  } catch (error) {
    console.error('signinエラー:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'ログイン中に不明なエラーが発生しました'
    )
  }
}

export const signOut = async (): Promise<{
  error?: string
}> => {
  try {
    await createClient().auth.signOut()
    console.log('signOut成功')
  } catch (error) {
    console.error('signOut error', error)
    throw new Error('サインアウト中にエラーが発生しました')
  }
  redirect(AFTER_SIGNOUT_PATH)
}

export const changeEmail = async (
  email: string
): Promise<{
  error?: string
}> => {
  try {
    console.log({ email })

    const { error } = await createClient().auth.updateUser({
      email
    })
    if (error) {
      console.log('changeEmail error', error)
      throw new Error('メールアドレス変更中にエラーが発生しました')
    }
    console.log('changeEmail成功', { email })
  } catch (error) {
    console.error('changeEmail error', error)
    throw new Error('メールアドレス変更中に不明なエラーが発生しました')
  }
  return {}
}

type ChangePasswordParams = {
  userId: string
}

export const changePassword = async (
  password: string
): Promise<{
  error?: string
}> => {
  try {
    const { error } = await createClient().auth.updateUser({
      password
    })
    if (error) {
      console.log('changePassword error', error)
      throw new Error('パスワード変更中にエラーが発生しました')
    }
    console.log('changePassword成功')
  } catch (error) {
    console.error('changePassword error', error)
    throw new Error('パスワード変更中に不明なエラーが発生しました')
  }
  return {}
}

type ResetPasswordParams = {
  email: string
}

export const resetPassword = async (
  email: string
): Promise<{
  error?: string
}> => {
  try {
    const { error } = await createClient().auth.resetPasswordForEmail(email)
    if (error) {
      console.log('resetPassword error', error)
      throw new Error('パスワードリセット中にエラーが発生しました')
    }
    console.log('resetPassword成功', { email })
  } catch (error) {
    console.error('resetPassword error', error)
    throw new Error('パスワードリセット中に不明なエラーが発生しました')
  }
  return {}
}
