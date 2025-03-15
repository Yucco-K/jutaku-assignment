'use client' // 👈 クライアントコンポーネントにする

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import UserProfile from './UserProfile'

const PUBLIC_PATHS = ['/', '/signup', '/admin/signin']

export default function ClientWrapper({
  children
}: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicPage = PUBLIC_PATHS.includes(pathname)

  return (
    <>
      {!isPublicPage && <Header />}
      {children}
    </>
  )
}
