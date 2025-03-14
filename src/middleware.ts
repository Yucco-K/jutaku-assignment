import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  isProd,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
} from '../util/env'
import type { Session } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { CookieOptionsBase } from '~/lib/supabase/cookie'

/**
 * Next.js middleware
 * Supabaseのセッションを更新する
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}

export async function middleware(req: NextRequest) {
  !isProd && console.log('middleware', req.url)

  return await updateSession(req)
}

async function updateSession(req: NextRequest) {
  const res = NextResponse.next()

  try {
    interface Cookie {
      name: string
      value: string
      options: Record<string, unknown>
    }

    interface SupabaseClient {
      auth: {
        getSession: () => Promise<{ data: { session: Session | null } }>
        getUser: () => Promise<{
          data: {
            user: {
              id: string
              email?: string
              user_metadata: {
                role?: string
                name?: string
                [key: string]: string | undefined
              }
            } | null
          }
          error: Error | null
        }>
      }
    }

    const supabase: SupabaseClient = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: async (): Promise<Cookie[]> =>
            req.cookies.getAll().map((cookie) => ({ ...cookie, options: {} })),
          setAll: async (cookiesToSet: Cookie[]): Promise<void> => {
            for (const cookie of cookiesToSet) {
              res.cookies.set(cookie.name, cookie.value, cookie.options)
            }
          }
        },
        cookieOptions: CookieOptionsBase
      }
    )

    const {
      data: { session }
    } = await supabase.auth.getSession()

    // ✅ 未認証ユーザーのリダイレクト
    if (!session) {
      if (req.nextUrl.pathname.startsWith('/admin/projects')) {
        return NextResponse.redirect(new URL('/admin/signin', req.url))
      }
      if (
        req.nextUrl.pathname.startsWith('/projects') ||
        req.nextUrl.pathname.startsWith('/entry-list')
      ) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // ✅ 認証済みユーザーのリダイレクト
    if (
      session &&
      (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/signup')
    ) {
      const { data: user, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.error('Failed to get user:', error)
        return res
      }

      const role = user?.user?.user_metadata?.role

      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/projects', req.url))
      }
      if (role === 'USER') {
        return NextResponse.redirect(new URL('/projects', req.url))
      }
    }

    // ✅ 一般ユーザーが `/admin` にアクセスした場合、リダイレクト
    if (req.nextUrl.pathname.startsWith('/admin/projects')) {
      const { data: user, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.error('Failed to get user:', error)
        return NextResponse.redirect(new URL('/', req.url))
      }

      const role = user.user?.user_metadata?.role
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return res
  } catch (e) {
    console.error('Error in middleware:', e)
    return res
  }
}
