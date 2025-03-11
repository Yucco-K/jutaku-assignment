'use server'

import {
  AFTER_SIGNIN_PATH,
  AFTER_SIGNOUT_PATH,
  AFTER_SIGNUP_FOR_DB_REGISTER_PATH
} from '@/const/config'
import { redirect } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'
import { serverApi } from '~/lib/trpc/server-api'
import { AuthError, AuthApiError } from '@supabase/supabase-js'
import { prisma } from '~/server/db'

type SignupParams = {
  email: string
  password: string
  name: string
}

type SigninParams = {
  email: string
  password: string
}

type SignupResponse = {
  error?: string
  code?: string
  success?: boolean
}

export const signup = async ({
  email,
  password,
  name
}: SignupParams): Promise<{ success: true; message: string }> => {
  try {
    console.log('signup:', { email, password, name })

    const authResponse = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (authResponse.error) {
      throw new Error(authResponse.error.message)
    }

    const user = authResponse.data.user
    if (!user?.id) {
      throw new Error('ユーザーIDの取得に失敗しました')
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    if (existingUser) {
      throw new Error('このユーザーは既に登録されています')
    }

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? '',
        name: name,
        role: 'USER'
      }
    })

    return { success: true, message: 'アカウントが作成されました' }
  } catch (error) {
    console.error('signup error:', error)
    throw new Error(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
  }
}

export const signin = async ({
  email,
  password
}: SigninParams): Promise<{ success: true; message: string }> => {
  try {
    console.log('signin:', { email, password })

    const { data, error } = await createClient().auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, message: 'ログインしました' }
  } catch (error) {
    console.error('signin error:', error)
    throw new Error(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
  }
}

export const signOut = async (): Promise<{
  success: true
  message: string
}> => {
  try {
    await createClient().auth.signOut()
    return { success: true, message: 'ログアウトしました' }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
  }
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
      throw new Error(error.message)
    }
    console.log('changeEmail成功', { email })
  } catch (error) {
    console.error('changeEmail error:', error)
    throw new Error(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
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
      throw new Error(error.message)
    }
    console.log('changePassword成功')
  } catch (error) {
    console.error('changePassword error', error)
    throw new Error(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
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
      throw new Error(error.message)
    }
    console.log('resetPassword成功', { email })
  } catch (error) {
    console.error('resetPassword error', error)
    throw new Error(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
  }
  return {}
}
