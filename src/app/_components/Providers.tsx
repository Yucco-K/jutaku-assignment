'use client'

import { MantineProvider } from '@mantine/core'
import { useEffect } from 'react'
import { createClient } from '~/lib/supabase/browser'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        window.location.reload()
      }
      if (event === 'SIGNED_OUT') {
        window.location.reload()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <MantineProvider>{children}</MantineProvider>
}
