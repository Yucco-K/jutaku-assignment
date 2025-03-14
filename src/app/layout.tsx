import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from '~/lib/trpc/client-api'
import '@mantine/core/styles.css'
import { ColorSchemeScript } from '@mantine/core'
import { Providers } from './_components/Providers'
import ClientWrapper from './_components/ClientWrapper'

const PUBLIC_PATHS = ['/', '/signup', '/admin/signin']

const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Project Matching Platform',
  description: 'Project Matching Platform Description'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TRPCProvider>
      <html lang="ja" data-mantine-color-scheme="light">
        <head>
          <ColorSchemeScript />
        </head>
        <body className={inter.className}>
          <Providers>
            <ClientWrapper>{children}</ClientWrapper>
          </Providers>
        </body>
      </html>
    </TRPCProvider>
  )
}
