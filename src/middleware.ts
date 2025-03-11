import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  isProd,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
} from '../util/env'
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

export async function updateSession(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers
    }
  })

  try {
    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: async () => req.cookies.getAll(),
          setAll: async (cookiesToSet) => {
            for (const cookie of cookiesToSet) {
              req.cookies.set(cookie.name, cookie.value)
            }

            res = NextResponse.next({ request: req })

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
      (req.nextUrl.pathname === '/' ||
        req.nextUrl.pathname === '/signup' ||
        req.nextUrl.pathname === '/signin')
    ) {
      const { data: user, error } = await supabase.auth.getUser()
      if (error) {
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

    // アドミンでないユーザーが/adminにアクセスした場合、ログインページにリダイレクト
    if (req.nextUrl.pathname.startsWith('/admin/projects')) {
      const { data: user, error } = await supabase.auth.getUser()
      if (user) {
        const role = user?.user?.user_metadata?.role
        if (role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/', req.url))
        }
      }
    }

    return res
  } catch (e) {
    console.error('Error in middleware:', e)
    return NextResponse.next({ request: { headers: req.headers } })
  }
}
